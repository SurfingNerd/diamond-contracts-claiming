
// get the memonic used from env variable.

import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { ethers } from "hardhat";

require("@nomiclabs/hardhat-ethers");

 // figure out exact numbers.
// 
// current Pot: 3,768,982
// we take 1 DMD from the delta pot for feeding the claiming pot.
//  3,768,981 DMD go into the delta pot.

// the rest is distributed in 3 DMD chunks,
// the last chunk that cannot hold 10.000 dmd will hold the rest.



task("fill", "fills the claiming pot.").setAction(async (hre: HardhatRuntimeEnvironment) => {


    let claimBeneficorAddress = "0x2000000000000000000000000000000000000001";
    let beneficorDAOAddress = "0xDA0da0da0Da0Da0Da0DA00DA0da0da0DA0DA0dA0";

    //let dillute1 =
    let speedUpMultiplier = 1 / 60;

    const month = 60 * 60 * 24 * 31;
    const dillute1 = 3 * month * speedUpMultiplier;
    const dillute2 = 6 * month * speedUpMultiplier;
    const dillute3 = 5 * 12 * month * speedUpMultiplier;

    const contractFactory = await ethers.getContractFactory("ClaimContract");
    const claimContract = await contractFactory.deploy(claimBeneficorAddress, beneficorDAOAddress, "", dillute1, dillute2, dillute3);



    let currentPot = 3768982;

    const signers = await  hre.ethers.getSigners();

    let currentBalance = signers[0].getBalance();

    let currentPotBN = hre.ethers.utils.parseEther(currentPot.toString());

    console.log('Pot: ', currentPotBN.toString());

    
    // expections on coin claiming:
    // claimed in phase 1: 75%
    // claimed in phase 2: 5%
    // claimed in phase 3: 5% 
    // never claimed:      15%

    const claim1Address1 = "0x69d1521d584e4F011A3ee4F620759aDAB758333b";
    const claim1AddressOld = "dDZuUpUDjbSxyufLJS1FkWxToq9k41dcAJ";
    const claim1Value = currentPot * 0.75;

    const claim2Address = "0x60348502c0C90d3ed90FD6E9037E2c3A1FfdB540";
    const claim2AddressOld = "dY5KBiex6p7wb1cchTYqhLWNrzSWBr49op";
    const claim2Value = currentPot * 0.05;

    const claim3Address = "0x94Df1f4D5BfbBd019F0C44d7f30351b12E568810";
    const claim3AddressOld = "dbdjYKKqYrKWuTSfQQAKdnXYUj5WLS4z6p";
    const claim3Value = currentPot * 0.05;

   
    // signers[0].sendTransaction( {to: claim1AddressOld, value: claim1Value});
    // signers[0].sendTransaction( {to: claim1AddressOld, value: claim1Value});
    // signers[0].sendTransaction( {to: claim1AddressOld, value: claim1Value});

    //let bn : ethers.BigNumber = ethers.BigNumber.from(claim1Value).mul();

    claimContract.addBalance(claim1AddressOld, { value: ethers.utils.parseEther(claim1Value.toString()) });
    claimContract.addBalance(claim2AddressOld, { value: ethers.utils.parseEther(claim2Value.toString()) });
    claimContract.addBalance(claim3AddressOld, { value: ethers.utils.parseEther(claim3Value.toString()) });

}

);
