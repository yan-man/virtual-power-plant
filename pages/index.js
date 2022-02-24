import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import styles from "../styles/Home.module.css";
import batteries from "./api/batteries";
import VirtualPowerPlantInstructions from "./components/VirtualPowerPlantInstructions";
import Title from "./components/Title";
// import batteryInfo from "./api/batteries";
// import BatteryCarousel from "../components/BatteryCarousel";
// import web3Contracts from "../services/web3Contracts";

function Home({ Web3Contracts }) {
  const year = new Date().getFullYear();
  // let Web3Contracts;
  // const [Web3Contracts, setWeb3Contracts] = useState(0);
  // useEffect(async () => {

  // }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Virtual Power Plant dApp - Yan Man</title>
        <meta
          name="Demo dApp for Virtual Power Plant"
          content="Virtual Power Plant"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div>Virtual Power Plant dApp</div>
      </header>
      <main className={styles.main}>
        <Container fluid>
          {/* <Row>
            <Title />
          </Row> */}
          <VirtualPowerPlantInstructions />
        </Container>
      </main>

      <footer className={styles.footer}>&#169; Yan Man {year}</footer>
    </div>
  );
}
// Home.getInitialProps = async (ctx) => {

//   // console.log(Web3Contracts);
//   return { Web3Contracts };
// };
export default Home;
