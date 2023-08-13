
// get the memonic used from env variable.

import { ethers } from "hardhat";

// figure out exact numbers.
// 
// current Pot: 3,768,982
// we take 1 DMD from the delta pot for feeding the claiming pot.
//  3,768,981 DMD go into the delta pot.

// the rest is distributed in 3 DMD chunks,
// the last chunk that cannot hold 10.000 dmd will hold the rest.



async function fillPots() {

    let claimBeneficorAddress = "";
    let beneficorDAOAddress = "";
     

    const contractFactory = await ethers.getContractFactory("ClaimContract");
    const claimContract = await contractFactory.deploy(claimBeneficorAddress, beneficorDAOAddress, "", dilluteTimestamps.dillute1, dilluteTimestamps.dillute2, dilluteTimestamps.dillute3);



let currentPot = 3768982;


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

const signers = await ethers.getSigners();

// signers[0].sendTransaction( {to: claim1AddressOld, value: claim1Value});
// signers[0].sendTransaction( {to: claim1AddressOld, value: claim1Value});
// signers[0].sendTransaction( {to: claim1AddressOld, value: claim1Value});



//let bn : ethers.BigNumber = ethers.BigNumber.from(claim1Value).mul();



    claimContract.addBalance(claim1AddressOld, { value: ethers.utils.parseEther(claim1Value.toString())});
    claimContract.addBalance(claim2AddressOld, { value: ethers.utils.parseEther(claim2Value.toString())});
    claimContract.addBalance(claim3AddressOld, { value: ethers.utils.parseEther(claim3Value.toString())});

} 
