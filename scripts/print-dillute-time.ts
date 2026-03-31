

import { ClaimContract__factory } from "../typechain-types";
import { ethers } from "hardhat";

async function print() {


    const signer = await ethers.provider.getSigner();
    console.log("using signer address: ", await signer.getAddress());


    const contractaddress = "0xf3bf614C0EA1D14D998BcDb49Ad1F8f57332Bb42";
    
    
    //const contractaddress = "0xCB9605E908679e7596cd67632CaffC980b5Bf895";

    const contract = ClaimContract__factory.connect(contractaddress, signer);

    const ts1 = await contract.getDilutionTimestamp1();
    const ts2 = await contract.getDilutionTimestamp2();
    const ts3 = await contract.getDilutionTimestamp3();
    

    const ts1Date = new Date(Number(ts1) * 1000);
    const ts2Date = new Date(Number(ts2) * 1000);
    const ts3Date = new Date(Number(ts3) * 1000);

    const now = BigInt(Math.floor(Date.now() / 1000));

    console.log("Dilution seconds to wait:", ts1 - now, " - ",ts2 - now, " - ", ts3 - now);
    
    console.log("address:", contractaddress);
    console.log("dilute1: ", contractaddress, " - ", contract.interface.encodeFunctionData("dilute1" ), " - ", ts1Date.toDateString() );
    console.log("dilute2: ", contractaddress, " - ", contract.interface.encodeFunctionData("dilute2" ), " - ", ts2Date.toDateString());
    console.log("dilute3: ", contractaddress, " - ", contract.interface.encodeFunctionData("dilute3" ), " - ", ts3Date.toDateString());

}


print();