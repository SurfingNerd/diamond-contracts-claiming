

import { getContractFactory } from "@nomicfoundation/hardhat-ethers/types";
import { ClaimContract, ClaimContract__factory } from "../typechain-types";
import { ethers } from "hardhat";

async function executeDilute2() {


    const signer = await ethers.provider.getSigner();

    console.log("using signer address: ", await signer.getAddress());


    const contractaddress = "0xe0E6787A55049A90aAa4335D0Ff14fAD26B8e88e";

    
    const contract = ClaimContract__factory.connect(contractaddress, signer);


    //const f = contract.interface.getFunction("dilute2");
    
    const calldata = contract.interface.encodeFunctionData("dilute3");
    
    console.log("calldata:", calldata);


    const response = await signer.sendTransaction({ to: contractaddress, data: calldata });

    console.log("dilute transaction sent: ", response.hash);


    const receipt = await response.wait();

    if (receipt) {
        console.log("dilute transaction mined in block: ", receipt.blockNumber);
    } else {
        console.log("transaction could not be mined.")
    }

    
    //console.log("dilute transaction sent: ", response.hash);
    
    
}


executeDilute2();