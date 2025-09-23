import hre from "hardhat";
import { CryptoSol } from "../api/src/cryptoSol";
import { ClaimContract, ClaimContract__factory } from "../typechain-types";
import { stringToUTF8Hex } from "../api/src/cryptoHelpers";
import { BalanceSnapshot, BalanceV3 } from "../api/data/interfaces";
import fs from 'fs';

let ethers = hre.ethers;
const prefix = "claim funds on DMDv4 Test Network according to the Whitepaper to the following address: ";

async function fillTestnet() {

    let claimBeneficorAddress = "0x2000000000000000000000000000000000000001";
    let beneficorDAOAddress = "0xDA0da0da0Da0Da0Da0DA00DA0da0da0DA0DA0dA0";
    let signer = (await hre.ethers.getSigners())[0];

    console.log("using signer:", signer.address);
    const signerBalance = await ethers.provider.getBalance(signer.address);
    console.log("balance:", signerBalance);

    if (signerBalance == BigInt(0)) {
      console.error("No Balance for this signer");
      return;
    }


    let now = Math.floor(Date.now() / 1000);
    let dillute1 = now + (86400 * 2 * 31) + 86400 * 30; // 3 months
    let dillute2 = now + (86400 * 3 * 31) + (86400 * 3 * 30); // 6 months
    let dillute3 = now + (86400 * 4 * 365) + (86400 * 366); // 5 years

    const contractFactory = await ethers.getContractFactory("ClaimContract");
    
    const prefixHex = stringToUTF8Hex(prefix);
    console.log("prefixHex", prefixHex);

     
    const claimContract = await contractFactory.deploy(claimBeneficorAddress, beneficorDAOAddress, prefixHex, dillute1, dillute2, dillute3);
    
    await claimContract.waitForDeployment();
    let claimContractAddress = await claimContract.getAddress();

    //const claimContractAny : any = contractFactory.attach("0xe0E6787A55049A90aAa4335D0Ff14fAD26B8e88e");
    
    //const claimContract = claimContractAny as ClaimContract;
    
    //await claimContract.waitForDeployment();
    // let claimContractAddress = await claimContract.getAddress();
    
    // console.log('claim contract deployed to:', claimContractAddress);


    let cryptoSol = new CryptoSol((claimContract as any) as ClaimContract);
    cryptoSol.setLogDebug(true);
    // it doesnt need to be super accurate, we can work with floating point numbers here.
    //let allCoins = 3824716;

    let sponsor = (await ethers.getSigners())[0];


    const snapshot = JSON.parse(fs.readFileSync('snapshots/snapshot-testnet.json', 'utf8')) as BalanceSnapshot;
    
    console.log("filling balances from snapshot block ", snapshot.block, " adresses:", snapshot.balances.length, "sponsor: ", sponsor.address);

    await cryptoSol.fillBalances(sponsor, snapshot.balances);
    

    console.log(`trying to verify.`);
    console.log(`npx command to verify localy - if the automated command fails:`); 
    console.log(`npx hardhat verify --network testnet ${claimContractAddress} ${claimBeneficorAddress} ${beneficorDAOAddress} ${prefixHex} ${dillute1} ${dillute2} ${dillute3}` );

    
    // await hre.run("verify:verify", {
    //     address: claimContractAddress,
    //     constructorArguments: [
    //         claimBeneficorAddress,
    //         beneficorDAOAddress,
    //         prefixHex,
    //         dillute1,
    //         dillute2,
    //         dillute3,
    //     ],
    //   });


}

fillTestnet();