import { ClaimContract } from "../typechain-types/ClaimContract";
import hre from "hardhat";

let ethers = hre.ethers;

async function main() {

    let claimBeneficorAddress = "0x2000000000000000000000000000000000000001";
    let beneficorDAOAddress = "0xDA0da0da0Da0Da0Da0DA00DA0da0da0DA0DA0dA0";

    //let dillute1 =
    let now = (Date.now() / 1000).toFixed(0);

    const month = 60 * 60 * 24 * 31;
    const dillute1 = now + 3 * month;
    const dillute2 = now + 6 * month;
    const dillute3 = now + 5 * 12 * month;

    const prefix = "0x";
    
    
    const contractFactory = await ethers.getContractFactory("ClaimContract");
    
    const claimContract = await contractFactory.deploy(claimBeneficorAddress, beneficorDAOAddress, prefix, dillute1, dillute2, dillute3);
    //const claimContract = claimContractAny as ClaimContract;
    
    let claimContractAddress = await claimContract.getAddress();
    console.log('claim contract deployed to:', claimContractAddress);

    console.log(`trying to verify.`);
    console.log(`npx command to verify localy - if the automated command fails:`); 
    console.log(`npx hardhat verify --network alpha2 ${claimContractAddress} ${claimBeneficorAddress} ${beneficorDAOAddress} ${prefix} ${dillute1} ${dillute2} ${dillute3}` );


    await hre.run("verify:verify", {
        address: claimContractAddress,
        constructorArguments: [
            claimBeneficorAddress,
            beneficorDAOAddress,
            prefix,
            dillute1,
            dillute2,
            dillute3,
        ],
      });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
