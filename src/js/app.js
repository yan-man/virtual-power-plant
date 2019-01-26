var batteriesArray = {};
App = {
  web3Provider: null,
  contracts: {},

  init: function() {

      var virtualPowerPlantOwner;
      var adminsNumPre;


      // const batteryInvestmentAddress= 5;


    // Load pets.
    $.getJSON('../batteries.json', function(data) {
      var batteryRow = $('#batteryRow');
      var battTemplate = $('#battTemplate');

      batteriesArray = data;
      // console.log(batteriesArray);

      for (i = 0; i < data.length; i ++) {
        battTemplate.find('.panel-title').text(data[i].name);
        battTemplate.find('.battery-serialNumber').text(data[i].serialNumber);
        battTemplate.find('.battery-capacity').text(data[i].capacity);
        battTemplate.find('.battery-currentFilled').text(data[i].currentFilled);
        battTemplate.find('.battery-cost').text(data[i].cost);
        battTemplate.find('.battery-priceThreshold').text(data[i].priceThreshold);
        battTemplate.find('.battery-chargeRate').text(data[i].chargeRate);
        // console.log(i)
        battTemplate.find('.btn-add-battery').attr('data-id', i);
        // batteriesArray.push(data[i]);
        batteryRow.append(battTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      // contract = require("truffle-contract");
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {

      // $.getJSON('VirtualPowerPlant.json', function(data) {
      //   // Get the necessary contract artifact file and instantiate it with truffle-contract
      //   var VirtualPowerPlantArtifact = data;
      //
      //   // console.log(VirtualPowerPlantArtifact.abi)
      //
      //   // Truffle contract is redundant to web3, but allows you to absorb truffle build files
      //   // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
      //   App.contracts.VirtualPowerPlant = TruffleContract(VirtualPowerPlantArtifact);
      //
      //   // Set the provider for our contract
      //   App.contracts.VirtualPowerPlant.setProvider(App.web3Provider);
      //
      //   // Use our contract to retrieve and mark the adopted pets
      //   return App.checkTest();
      // });



      $.getJSON('VirtualPowerPlant.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var VirtualPowerPlantArtifact = data;



        // Truffle contract is redundant to web3, but allows you to absorb truffle build files
        // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
        App.contracts.VirtualPowerPlant = TruffleContract(VirtualPowerPlantArtifact);

        // Set the provider for our contract
        App.contracts.VirtualPowerPlant.setProvider(App.web3Provider);

        // Use our contract to retrieve and mark the adopted pets
        return App.showInvestmentAmount();
    });

      // $.getJSON('BatteryInvestment.json', function(data) {
      //   // Get the necessary contract artifact file and instantiate it with truffle-contract
      //   var BatteryInvestmentArtifact = data;
      //   // Truffle contract is redundant to web3, but allows you to absorb truffle build files
      //   // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
      //   App.contracts.BatteryInvestment = TruffleContract(BatteryInvestmentArtifact);
      //
      //   // Set the provider for our contract
      //   App.contracts.BatteryInvestment.setProvider(App.web3Provider);
      //
      //   console.log(batteryInvestmentAddress)
      //
      //   // var BatteryInvestmentContract = web3.eth.contract(BatteryInvestmentArtifact);
      //   //
      //   // var BatteryInvestment = BatteryInvestmentContract.at('PASTE CONTRACT ADDRESS HERE');
      //   // console.log(BatteryInvestmentAddress);
      //   // console.log(BatteryInvestmentContract);
      //   // console.log(BatteryInvestmentArtifact);
      //
      //   // Use our contract to retrieve and mark the adopted pets
      //   // return App.checkInvestment();
      // });


    // $(".btn-add-battery").click(App.addBattery);
    return App.bindEvents();
  },

  bindEvents: function() {
      // $("button").click(App.addBattery);
    $(document).on('click', '.btn-add-battery', App.addBattery);
    $(document).on('click', '.btn-invest', App.investMoney);
    $(document).on('click', '.btn-check-energy', App.checkBatteryEnergy);
    $(document).on('click', '.btn-trigger-dividend', App.triggerDividend);
    $(document).on('click', '.btn-withdraw', App.withdraw);
    // $(document).on('click', '.btn-admin', App.setAdmin);
  },
  deployInvestment: function() {

    var BatteryInvestmentInstance;
    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      VirtualPowerPlantInstance = instance;



      return VirtualPowerPlantInstance.batteryInvestmentAddress();

      }).then(function(batteryInvestmentAddress) {
          // console.log(batteryEnergyAddress);

          $.getJSON('BatteryInvestment.json', function(data) {

              console.log(batteryInvestmentAddress);
              // console.log(data)


            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var BatteryInvestmentArtifact = data;

            // console.log(VirtualPowerPlantArtifact.abi)

            // Truffle contract is redundant to web3, but allows you to absorb truffle build files
            // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
            App.contracts.BatteryInvestment = TruffleContract(BatteryInvestmentArtifact);

            // Set the provider for our contract
            App.contracts.BatteryInvestment.setProvider(App.web3Provider);

            App.contracts.BatteryInvestment.at(batteryInvestmentAddress).then(function(instance) {
              BatteryInvestmentInstance = instance;
              return BatteryInvestmentInstance.investmentPercentage();
              // return coin.sendCoin(account_two, 3, {from: account_one});
          }).then(function(investmentPercentage){
              console.log(investmentPercentage)
          });

            // console.log(App.contracts.BatteryInvestment)
        });



      }).catch(function(err) {
        console.log(err.message);
      });

    // }).then(function(adminsNumPre) {
    //     console.log(adminsNumPre);
    // }).catch(function(err) {
    //   console.log(err.message);
    // });
  },
  showInvestmentAmount: function() {

    var BatteryInvestmentInstance;
    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      VirtualPowerPlantInstance = instance;



      return VirtualPowerPlantInstance.batteryInvestmentAddress();

      }).then(function(batteryInvestmentAddress) {
          // console.log(batteryInvestmentAddress );

          $.getJSON('BatteryInvestment.json', function(data) {

              // console.log(batteryInvestmentAddress)
              // console.log(data)


            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var BatteryInvestmentArtifact = data;

            // Truffle contract is redundant to web3, but allows you to absorb truffle build files
            // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
            App.contracts.BatteryInvestment = TruffleContract(BatteryInvestmentArtifact);

            // Set the provider for our contract
            App.contracts.BatteryInvestment.setProvider(App.web3Provider);

            App.contracts.BatteryInvestment.at(batteryInvestmentAddress).then(function(instance) {
              BatteryInvestmentInstance = instance;
              return BatteryInvestmentInstance.totalInvestment();
              // return coin.sendCoin(account_two, 3, {from: account_one});
          }).then(function(totalInvestment){
              // totalInvestment = ;
              console.log("Investment Amount:"+web3.fromWei(totalInvestment, 'ether'));
               $('#totalInvestment').text(web3.fromWei(totalInvestment, "ether"), function (err, result){
                   console.log(err);
                   console.log(result);
               });
               return BatteryInvestmentInstance.remainingInvestment();
          }).then(function(remainingInvestment){
              $('#remainingInvestment').text(web3.fromWei(remainingInvestment, "ether"), function (err, result){
                  console.log(err);
                  console.log(result);
              });
          });

            // console.log(App.contracts.BatteryInvestment)
        });



      }).catch(function(err) {
        console.log(err.message);
      });

    // }).then(function(adminsNumPre) {
    //     console.log(adminsNumPre);
    // }).catch(function(err) {
    //   console.log(err.message);
    // });
  },
  showBatteryFill: function() {

    var BatteryInvestmentInstance;
    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      VirtualPowerPlantInstance = instance;


      return VirtualPowerPlantInstance.getBatteryMapping();

      }).then(function(getBatteryMapping) {
          console.log(getBatteryMapping);



      }).catch(function(err) {
        console.log(err.message);
      });

    // }).then(function(adminsNumPre) {
    //     console.log(adminsNumPre);
    // }).catch(function(err) {
    //   console.log(err.message);
    // });
  },
  checkTest: function(adopters, account) {
    var VirtualPowerPlantInstance;

    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      VirtualPowerPlantInstance = instance;

      // console.log(VirtualPowerPlantInstance);

      // adminsNumPre = VirtualPowerPlantInstance.numAdmins();
      // return VirtualPowerPlantInstance;
      // console.log(BatteryInvestmentAddress)
      // return virtualPowerPlantOwner;

      // return adoptionInstance.getAdopters.call();

      }).catch(function(err) {
        console.log(err.message);
      });



    // }).then(function(adminsNumPre) {
    //     console.log(adminsNumPre);
    // }).catch(function(err) {
    //   console.log(err.message);
    // });
  },

  // markAdopted: function(adopters, account) {
  //   var adoptionInstance;
  //
  //   App.contracts.Adoption.deployed().then(function(instance) {
  //     adoptionInstance = instance;
  //
  //     return adoptionInstance.getAdopters.call();
  //   }).then(function(adopters) {
  //     for (i = 0; i < adopters.length; i++) {
  //       if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
  //         $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
  //       }
  //     }
  //   }).catch(function(err) {
  //     console.log(err.message);
  //   });
  // },

//   handleAdopt: function(event) {
//     event.preventDefault();
//
//     var petId = parseInt($(event.target).data('id'));
//     var adoptionInstance;
//
//     web3.eth.getAccounts(function(error, accounts) {
//       if (error) {
//         console.log(error);
//       }
//
//       var account = accounts[0];
//
//       App.contracts.Adoption.deployed().then(function(instance) {
//         adoptionInstance = instance;
//
//         // Execute adopt as a transaction by sending account
//         return adoptionInstance.adopt(petId, {from: account});
//       }).then(function(result) {
//         return App.markAdopted();
//       }).catch(function(err) {
//         console.log(err.message);
//       });
//     });
// },

setAdmin: function(event) {
    event.preventDefault();

    // var petId = parseInt($(event.target).data('id'));
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
        virtualPowerPlantInstance = instance;

        // console.log(account);
        // console.log(virtualPowerPlantInstance);

        // Execute adopt as a transaction by sending account
        return virtualPowerPlantInstance.setAdmin(account, true, {from: virtualPowerPlantOwner});
      }).then(function(result) {
          console.log(result)
        // return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
},
investMoney: function(event) {
  event.preventDefault();

  var investmentAmount = $(".investmentAmount").val();

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];



    var BatteryInvestmentInstance;

    // console.log(web3.eth.getBalance(account, function(error, accounts) { console.log(account) }));

    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      VirtualPowerPlantInstance = instance;

      // console.log(investmentAmount);
      // console.log(account);

      return VirtualPowerPlantInstance.batteryInvestmentAddress();

      }).then(function(batteryInvestmentAddress) {
          // console.log(batteryEnergyAddress);

          $.getJSON('BatteryInvestment.json', function(data) {

              // console.log(batteryInvestmentAddress)
              // console.log(data)


            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var BatteryInvestmentArtifact = data;

            // console.log(VirtualPowerPlantArtifact.abi)

            // Truffle contract is redundant to web3, but allows you to absorb truffle build files
            // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
            App.contracts.BatteryInvestment = TruffleContract(BatteryInvestmentArtifact);

            // Set the provider for our contract
            App.contracts.BatteryInvestment.setProvider(App.web3Provider);

            App.contracts.BatteryInvestment.at(batteryInvestmentAddress).then(function(instance) {
              BatteryInvestmentInstance = instance;


              return BatteryInvestmentInstance.investMoney({from: account, value: web3.toWei(investmentAmount, "ether")});
              // return coin.sendCoin(account_two, 3, {from: account_one});
          }).then(function(totalInvestment){
              console.log(totalInvestment)
              // return BatteryInvestmentInstance.totalInvestment();
              App.showInvestmentAmount();
          });

            // console.log(App.contracts.BatteryInvestment)
        });



      }).catch(function(err) {
        console.log(err.message);
      });

  });
},
withdraw: function(event) {
  event.preventDefault();

  // var investmentAmount = $(".investmentAmount").val();

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];
    var BatteryInvestmentInstance;

    // console.log(web3.eth.getBalance(account, function(error, accounts) { console.log(account) }));

    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      VirtualPowerPlantInstance = instance;

      // console.log(investmentAmount);
      // console.log(account);

      return VirtualPowerPlantInstance.batteryInvestmentAddress();

      }).then(function(batteryInvestmentAddress) {
          // console.log(batteryEnergyAddress);

          $.getJSON('BatteryInvestment.json', function(data) {

              // console.log(batteryInvestmentAddress)
              // console.log(data)


            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var BatteryInvestmentArtifact = data;

            // console.log(VirtualPowerPlantArtifact.abi)

            // Truffle contract is redundant to web3, but allows you to absorb truffle build files
            // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
            App.contracts.BatteryInvestment = TruffleContract(BatteryInvestmentArtifact);

            // Set the provider for our contract
            App.contracts.BatteryInvestment.setProvider(App.web3Provider);

            App.contracts.BatteryInvestment.at(batteryInvestmentAddress).then(function(instance) {
              BatteryInvestmentInstance = instance;
              // BatteryInvestmentInstance.triggerDividend();

              return BatteryInvestmentInstance.addPendingWithdrawals(account);

              // return BatteryInvestmentInstance;
              // return coin.sendCoin(account_two, 3, {from: account_one});
          }).then(function(){
              return BatteryInvestmentInstance.withdraw();

          });

            // console.log(App.contracts.BatteryInvestment)
        });



      }).catch(function(err) {
        console.log(err.message);
      });

  });
},
triggerDividend: function(event) {
  event.preventDefault();

  // var investmentAmount = $(".investmentAmount").val();

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];
    var BatteryInvestmentInstance;

    // console.log(web3.eth.getBalance(account, function(error, accounts) { console.log(account) }));

    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      VirtualPowerPlantInstance = instance;

      // console.log(investmentAmount);
      // console.log(account);

      return VirtualPowerPlantInstance.batteryInvestmentAddress();

      }).then(function(batteryInvestmentAddress) {
          // console.log(batteryEnergyAddress);

          $.getJSON('BatteryInvestment.json', function(data) {

              // console.log(batteryInvestmentAddress)
              // console.log(data)


            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var BatteryInvestmentArtifact = data;

            // console.log(VirtualPowerPlantArtifact.abi)

            // Truffle contract is redundant to web3, but allows you to absorb truffle build files
            // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
            App.contracts.BatteryInvestment = TruffleContract(BatteryInvestmentArtifact);

            // Set the provider for our contract
            App.contracts.BatteryInvestment.setProvider(App.web3Provider);

            App.contracts.BatteryInvestment.at(batteryInvestmentAddress).then(function(instance) {
              BatteryInvestmentInstance = instance;
              // BatteryInvestmentInstance.triggerDividend();

              return BatteryInvestmentInstance.pendingTotalWithdrawals(0);

              // return BatteryInvestmentInstance;
              // return coin.sendCoin(account_two, 3, {from: account_one});
          }).then(function(pendingTotalWithdrawals){
              console.log(pendingTotalWithdrawals)
              // return BatteryInvestmentInstance.totalInvestment();
              // console.log(BatteryInvestmentInstance.pendingWithdrawals(account));
              // App.showInvestmentAmount();
              return BatteryInvestmentInstance.pendingTotalWithdrawals(0);
          }).then(function(pendingTotalWithdrawals){
              console.log(pendingTotalWithdrawals)

              return BatteryInvestmentInstance.pendingWithdrawals(account);
          }).then(function(pendingWithdrawals){
              console.log(pendingWithdrawals)
          });

            // console.log(App.contracts.BatteryInvestment)
        });



      }).catch(function(err) {
        console.log(err.message);
      });

  });
},
checkBatteryEnergy: function(event) {
  event.preventDefault();

  var investmentAmount = $(".investmentAmount").val();

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    var BatteryInvestmentInstance;

    // console.log(web3.eth.getBalance(account, function(error, accounts) { console.log(account) }));

    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      VirtualPowerPlantInstance = instance;

      // console.log(investmentAmount);
      // console.log(account);

      return VirtualPowerPlantInstance.batteryEnergyAddress();

      }).then(function(batteryEnergyAddress) {
          // console.log(batteryEnergyAddress);

          $.getJSON('BatteryEnergy.json', function(data) {

              // console.log(batteryInvestmentAddress)
              // console.log(data)


            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var BatteryEnergyArtifact = data;

            // console.log(VirtualPowerPlantArtifact.abi)

            // Truffle contract is redundant to web3, but allows you to absorb truffle build files
            // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
            App.contracts.BatteryEnergy = TruffleContract(BatteryEnergyArtifact);

            // Set the provider for our contract
            App.contracts.BatteryEnergy.setProvider(App.web3Provider);

            App.contracts.BatteryEnergy.at(batteryEnergyAddress).then(function(instance) {
              BatteryEnergyInstance = instance;

              return BatteryEnergyInstance.checkBatteryEnergy();
              // return coin.sendCoin(account_two, 3, {from: account_one});
          }).then(function(){
              // console.log(totalInvestment)
              // return BatteryInvestmentInstance.totalInvestment();
              App.showInvestmentAmount();
          }).then(function(){
              App.showBatteryFill();
          });

            // console.log(App.contracts.BatteryInvestment)
        });



      }).catch(function(err) {
        console.log(err.message);
      });

  });
},
addBattery: function(event) {
  event.preventDefault();

  // console.log(event)


  var batteryID = $(this).data('id');
  // var capacity = battery.find('.battery-capacity');

  // console.log(batteryID);
  // console.log(virtualPowerPlantOwner);
  // console.log(batteriesArray);

  // owner.then(function(result){console.log(result)});

  // var petId = parseInt($(event.target).data('id'));
  var virtualPowerPlantInstance;

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    // console.log($(this).data('id'));

    // console.log($(".btn-add-battery").attr('class'));
    // console.log(accounts);

    App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
      virtualPowerPlantInstance = instance;
      var battery = batteriesArray[batteryID];

      return virtualPowerPlantInstance.addBattery(
          battery.capacity,
          battery.currentFilled,
          web3.toWei(battery.cost, "ether"),
          battery.serialNumber,
          battery.priceThreshold,
          battery.chargeRate
      );

    }).then(function() {
        App.showInvestmentAmount();
    }).then(function(){
        $('[data-id="'+batteryID+'"]').text('Success!').attr('disabled', true);
        // $('[data-id="'+batteryID+'"]').parent(".panel-body")
        $('[data-id="'+batteryID+'"]').parent(".panel-body").css("background", "lightblue");
        // $(document).on('click', '.btn-add-battery', App.decommissionBattery);
    }).catch(function(err) {
      console.log(err.message);
    });
  });
},
printUsers: function(event) {
  event.preventDefault();

  // owner.then(function(result){console.log(result)});

  // var petId = parseInt($(event.target).data('id'));
  var adoptionInstance;

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    // var account = accounts[0];

    console.log(accounts);

    // App.contracts.Adoption.deployed().then(function(instance) {
    //   adoptionInstance = instance;
    //
    //   // Execute adopt as a transaction by sending account
    //   return adoptionInstance.adopt(petId, {from: account});
    // }).then(function(result) {
    //   return App.markAdopted();
    // }).catch(function(err) {
    //   console.log(err.message);
    // });
  });
}

};

// $(function() {
//   $(window).load(function() {
//
//     App.init();
//   });
// });

window.onload = function() {

    App.init();
    // if (window.jQuery) {
    //     // jQuery is loaded
    //     alert("Yeah!");
    // } else {
    //     // jQuery is not loaded
    //     alert("Doesn't Work");
    // }
}
