import hre from "hardhat";
import { CryptoSol } from "../api/src/cryptoSol";
import { ClaimContract, ClaimContract__factory } from "../typechain-types";
import { stringToUTF8Hex } from "../api/src/cryptoHelpers";
import { BalanceSnapshot, BalanceV3 } from "../api/data/interfaces";
import fs from 'fs';

let ethers = hre.ethers;
const prefix = "claim alpha5 to this very long message that is supposed to be long enought so we also have long messages covered up in the claiming processes. this is still an open issue and the last CI pipeline test failed with long messages. so this time i hope it works better. claim to the following address: ";

async function fillAlpha5() {



    let claimBeneficorAddress = "0x2000000000000000000000000000000000000001";
    let beneficorDAOAddress = "0xDA0da0da0Da0Da0Da0DA00DA0da0da0DA0DA0dA0";

    //let dillute1 =
    let now = (Date.now() / 1000).toFixed(0);

    let signer = (await hre.ethers.getSigners())[0];

    

    console.log("using signer:", signer.address);
    const signerBalance = await ethers.provider.getBalance(signer.address);
    console.log("balance:", signerBalance);

    if (signerBalance == BigInt(0)) {
      console.error("No Balance for this signer");
      return;
    }

    const day = 60 * 60 * 24;
    const dillute1 = now + 7 * day;
    const dillute2 = dillute1 + 7 * day;
    const dillute3 = dillute2 + 14 * day;

    const contractFactory = await ethers.getContractFactory("ClaimContract");
    
    const prefixHex = stringToUTF8Hex(prefix);
    console.log("prefixHex", prefixHex);
    const claimContractAny : any = await contractFactory.deploy(claimBeneficorAddress, beneficorDAOAddress, prefixHex, dillute1, dillute2, dillute3);
    const claimContract = claimContractAny as ClaimContract;
    
    await claimContract.waitForDeployment();
    let claimContractAddress = await claimContract.getAddress();
    console.log('claim contract deployed to:', claimContractAddress);
    console.log(`trying to verify.`);
    console.log(`npx command to verify localy - if the automated command fails:`); 
    console.log(`npx hardhat verify --network alpha5 ${claimContractAddress} ${claimBeneficorAddress} ${beneficorDAOAddress} ${prefixHex} ${dillute1} ${dillute2} ${dillute3}` );


    let cryptoSol = new CryptoSol(claimContract);
    cryptoSol.setLogDebug(true);
    // it doesnt need to be super accurate, we can work with floating point numbers here.
    //let allCoins = 3824716;

    let sponsor = (await ethers.getSigners())[0];


    const snapshot = JSON.parse(fs.readFileSync('snapshots/snapshot-alpha5.json', 'utf8')) as BalanceSnapshot;
    
    console.log("filling balances from snapshot block ", snapshot.block, " adresses:", snapshot.balances.length, "sponsor: ", sponsor.address);

    await cryptoSol.fillBalances(sponsor, snapshot.balances);
    
   // await cryptoSol.claim(balanceRow.dmdv3Address, balanceRow.dmdv4Address, balanceRow.signature, "", true
  //  let signature = "IG8j0HGlWUh4SUpd4hgjFaumIPKybGxAevm35RnMwEkYZ+HWYD0IKODVkldrzfqJWdh+26y4fR5Ihmyzht+FdSM=";
  //  let dmdV4Address = "0xdd37EA7bA22500A43D28378b62A0fCA89bCCFd6F";

    //await cryptoSol.claim(dmdV3Address, dmdV4Address, signature);
    
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

fillAlpha5();