var batteriesArray = {};
App = {
  web3Provider: null,
  contracts: {},

  init: function() {

      var virtualPowerPlantOwner;
      var adminsNumPre;

    $.getJSON('../batteries.json', function(data) {
      var batteryRow = $('#batteryRow');
      var battTemplate = $('#battTemplate');

      // update list of batteries that can be added to the array
      batteriesArray = data;

      for (i = 0; i < data.length; i++) {
        battTemplate.find('.panel-title').text(data[i].name);
        battTemplate.find('.battery-serialNumber').text(data[i].serialNumber);
        battTemplate.find('.battery-capacity').text(data[i].capacity);
        battTemplate.find('.battery-currentFilled').text(data[i].currentFilled);
        battTemplate.find('.battery-cost').text(data[i].cost);
        battTemplate.find('.battery-priceThreshold').text(data[i].priceThreshold);
        battTemplate.find('.battery-chargeRate').text(data[i].chargeRate);
        battTemplate.find('.btn-add-battery').attr('data-id', i);
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
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },
  initContract: function() {

    $.getJSON('VirtualPowerPlant.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var VirtualPowerPlantArtifact = data;
        // create VPP contract
        App.contracts.VirtualPowerPlant = TruffleContract(VirtualPowerPlantArtifact);
        // Set the provider for our contract
        App.contracts.VirtualPowerPlant.setProvider(App.web3Provider);
        // Use our contract to retrieve and show the investment amount
        return App.showInvestmentAmount();
    }).then(function(){
        return App.labelBatteriesAdded();
    }).then(function(){
        return App.labelOwner();
    });
    $("#contractDeployed").text("Contract Deployed Successfully!");
    // bind button events
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-add-battery', App.addBattery);
    $(document).on('click', '.btn-invest', App.investMoney);
    $(document).on('click', '.btn-check-energy', App.checkBatteryEnergy);
    $(document).on('click', '.btn-trigger-dividend', App.triggerDividend);
    $(document).on('click', '.btn-withdraw', App.withdraw);
  },

    showInvestmentAmount: function() {

        var BatteryInvestmentInstance;
        App.contracts.VirtualPowerPlant.deployed().then(function(instance) {
          VirtualPowerPlantInstance = instance;
          return VirtualPowerPlantInstance.batteryInvestmentAddress();
          }).then(function(batteryInvestmentAddress) {

              $.getJSON('BatteryInvestment.json', function(data) {

                // Get the necessary contract artifact file and instantiate it with truffle-contract
                var BatteryInvestmentArtifact = data;

                // Truffle contract is redundant to web3, but allows you to absorb truffle build files
                // with deployed addresses and ABIs that you  would have to set otherwise in Web3 - NJ
                App.contracts.BatteryInvestment = TruffleContract(BatteryInvestmentArtifact);
                // Set the provider for our contract
                App.contracts.BatteryInvestment.setProvider(App.web3Provider);
                App.contracts.BatteryInvestment.at(batteryInvestmentAddress).then(function(instance) {
                BatteryInvestmentInstance = instance;
                return BatteryInvestmentInstance.remainingInvestment();
              }).then(function(remainingInvestment){
                  // update remaining investment text
                  $('#remainingInvestment').text(web3.fromWei(remainingInvestment, "ether"), function (err, result){
                      console.log(err);
                      console.log(result);
                  });
                  return VirtualPowerPlantInstance.numBatteries();
              }).then(function(numBatteries){
                  // show number of batteries in the array
                  $('#numBatteries').text(numBatteries.toString());
                  return App.showBatteryFill();
              });

            });

          }).catch(function(err) {
            console.log(err.message);
          });
    },
    showBatteryUpdate: async () => {

      var BatteryInvestmentInstance;

      let VirtualPowerPlantInstance = await App.contracts.VirtualPowerPlant.deployed();

      let numBatteries = await VirtualPowerPlantInstance.numBatteries();
      // console.log(numBatteries);

      for (var battCounter = 0; battCounter < numBatteries; battCounter++){
          var info = await VirtualPowerPlantInstance.getRelevantBatteryInfo(battCounter);
          // console.log(info[1].toString())
          var serialNumber = info[2].toString().substring(0, 3);
          var currentFilled = info[1].toString();

          console.log(serialNumber);

          $.getJSON('../batteries.json', function(data) {

            batteriesArray = data;

            for (i = 0; i < data.length; i ++) {

                var batteryID = i;
              if(data[i].serialNumber == serialNumber){

                  $('[data-id="'+batteryID+'"]').parent(".panel-body").find(".battery-currentFilledTitle").css("color", "red");

                  if (parseInt(currentFilled) > parseInt($('[data-id="'+batteryID+'"]').parent(".panel-body").find(".battery-currentFilled").text())) {

                      console.log(data[i].serialNumber + " light green");

                      $('[data-id="'+batteryID+'"]').parent(".panel-body").css("background", "lightgreen");
                  } else if (parseInt(currentFilled) <= parseInt($('[data-id="'+batteryID+'"]').parent(".panel-body").find(".battery-currentFilled").text())) {
                      console.log(data[i].serialNumber + " light pink");

                      $('[data-id="'+batteryID+'"]').parent(".panel-body").css("background", "lightpink");
                  }
                  $('[data-id="'+batteryID+'"]').parent(".panel-body").find(".battery-currentFilled").text(currentFilled);
              }
            }
          });
      }
    },
    labelBatteriesAdded: async () => {

      var BatteryInvestmentInstance;
      let VirtualPowerPlantInstance = await App.contracts.VirtualPowerPlant.deployed();

      let numBatteries = await VirtualPowerPlantInstance.numBatteries();

      for (var battCounter = 0; battCounter < numBatteries; battCounter++){
          var info = await VirtualPowerPlantInstance.getRelevantBatteryInfo(battCounter);
          var serialNumber = info[2].toString().substring(0, 3);
          var currentFilled = info[1].toString();

          console.log(serialNumber);

          $.getJSON('../batteries.json', function(data) {

            batteriesArray = data;
            for (i = 0; i < data.length; i ++) {
              var batteryID = i;
              if(data[i].serialNumber == serialNumber){
                  $('[data-id="'+batteryID+'"]').parent(".panel-body").css("background", "lightblue");
                  $('[data-id="'+batteryID+'"]').text('Success!').attr('disabled', true);
              }
            }
          });
      }
    },
    labelOwner: async () => {

      let VirtualPowerPlantInstance = await App.contracts.VirtualPowerPlant.deployed();

      let owner = await VirtualPowerPlantInstance.owner();
      $("#owner").text(owner);

    },
    showBatteryFill: async () => {

      var BatteryInvestmentInstance;

      let VirtualPowerPlantInstance = await App.contracts.VirtualPowerPlant.deployed();

      let numBatteries = await VirtualPowerPlantInstance.numBatteries();
      // console.log(numBatteries);

      for (var battCounter = 0; battCounter < numBatteries; battCounter++){
          var info = await VirtualPowerPlantInstance.getRelevantBatteryInfo(battCounter);
          // console.log(info[1].toString())
          var serialNumber = info[2].toString().substring(0, 3);
          var currentFilled = info[1].toString();

          console.log(serialNumber);

          $.getJSON('../batteries.json', function(data) {

            batteriesArray = data;

            for (i = 0; i < data.length; i ++) {

                var batteryID = i;
              if(data[i].serialNumber == serialNumber){
                  $('[data-id="'+batteryID+'"]').parent(".panel-body").find(".battery-currentFilled").text(currentFilled);
              }
            }
          });
      }
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
              }).then(function(checkBatteryCompleted){
                  // console.log(totalInvestment)
                  // return BatteryInvestmentInstance.totalInvestment();
                  App.showInvestmentAmount();
              }).then(function(){
                  App.showBatteryUpdate();
              });

            });



          }).catch(function(err) {
            console.log(err.message);
          });

      });
    },
    addBattery: function(event) {
      event.preventDefault();
      var batteryID = $(this).data('id');
      var virtualPowerPlantInstance;

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];

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
    }

};


window.onload = function() {
    App.init();
}
