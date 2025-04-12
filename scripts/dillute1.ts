

import { getContractFactory } from "@nomicfoundation/hardhat-ethers/types";
import { ClaimContract, ClaimContract__factory } from "../typechain-types";
import { ethers } from "hardhat";

async function executeDilute1() {


    const signer = await ethers.provider.getSigner();

    console.log("using signer address: ", await signer.getAddress());


    const contractaddress = "0xe0E6787A55049A90aAa4335D0Ff14fAD26B8e88e";

    
    const contract = ClaimContract__factory.connect(contractaddress, signer);


    await  contract.dilute1();

    
}


executeDilute1();