
import { CryptoSol } from "../api/src/cryptoSol";
import { ClaimContract, ClaimContract__factory } from "../typechain-types";
import hre from "hardhat";

let ethers = hre.ethers;

async function main() {

    let claimContractAddress = "0xCAFa71b474541D1676093866088ccA4AB9a07722";
    // get the claiming contract from ethereum address.
    const signer = await ethers.provider.getSigner()
    const claimingContract = ClaimContract__factory.connect(claimContractAddress, signer);
    let cryptoSol = new CryptoSol(claimingContract as ClaimContract);
    let block = await ethers.provider.getBlock("latest");
    console.log("block timestamp:", block?.timestamp);
    console.log("dilute1 timestamp:", await cryptoSol.instance.getDilutionTimestamp1());
    // cryptoSol.dilute1();
}

main();

