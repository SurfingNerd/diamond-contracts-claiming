

import { getContractFactory } from "@nomicfoundation/hardhat-ethers/types";
import { ClaimContract, ClaimContract__factory } from "../typechain-types";
import { ethers } from "hardhat";

async function executeDilute1() {


    const signer = await ethers.provider.getSigner();

    console.log("using signer address: ", await signer.getAddress());


    const contractaddress = "0xf3bf614C0EA1D14D998BcDb49Ad1F8f57332Bb42";

    
    const contract = ClaimContract__factory.connect(contractaddress, signer);


    const ts1 = await contract.getDilutionTimestamp1();
    const ts2 = await contract.getDilutionTimestamp2();
    const ts3 = await contract.getDilutionTimestamp3();
    
    const now = BigInt(Math.floor(Date.now() / 1000));
    console.log("Dilution seconds to wait:", ts1 - now, " - ",ts2 - now, " - ", ts3 - now);
    
}


executeDilute1();