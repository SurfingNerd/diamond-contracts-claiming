import { ethers, network } from "hardhat";
// import type { ethers } from "ethers";
import { BigNumber } from "ethers";

const TestFunctions = require('../api/tests/testFunctions');
const CryptoSol = require('../api/src/cryptoSol');
const CryptoJS = require('../api/src/cryptoJS');
const cryptoHelpers = require('../api/src/cryptoHelpers');


import {
    ClaimContract
} from "../typechain-types/index";


import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BigNumber))
    .should();


var EC = require('elliptic').ec;
var BN = require('bn.js');
var ec = new EC('secp256k1');


//const { default: cryptoJS } = require('../api/js/cryptoJS');

///const ClaimContract = artifacts.require('ClaimContract');

let claimContract: ClaimContract;

let cryptoJS = new CryptoJS.CryptoJS();
let signers = await ethers.getSigners();

const lateClaimBeneficorAddress = signers[0].address;
const lateClaimBeneficorDAO = signers[1].address;


describe('ClaimContract', () => {
    it('deploying a new claim contract', async () => {

        const ClaimContractFactory = await ethers.getContractFactory("ClaimContract");
        const depoyment = await ClaimContractFactory.deploy(lateClaimBeneficorAddress, lateClaimBeneficorDAO, '0x');
        
        testFunctions = new TestFunctions.TestFunctions(web3, claimContract.contract);
        cryptoSol = new CryptoSol.CryptoSol(web3, claimContract.contract);
      })
    
        
});

  //const callParams = {from: accounts[0]};

  
  // console.error('Type of CryptoJS', typeof CryptoJS);
  // console.error('Type of CryptoJS', CryptoJS);
  // console.error('Type of CryptoJS.CryptoJS', typeof  CryptoJS.CryptoJS);
  
  
  it('correct Address checksum.', async() => {
    testFunctions.testAddressChecksum();
  })    

  it('addressToClaimMessage delivers expected claimMessage.', async() => {

    await testFunctions.testMessageMagicHexIsCorrect();
    // const address = '0xb56c4974EB4CFC2B339B441a4Ae854FeBE2B6504';
    // //todo: define the real expected result to make sure that this works.
    // const expectedResult = '0x18426974636f696e205369676e6564204d6573736167653a0a28307862353663343937344542344346433242333339423434316134416538353446654245324236353034'
    // const result = await cryptoSol.addressToClaimMessage(address);
    // assert.equal(result, expectedResult);
    // //console.log('claim Message: ', result);
  })


  it('PublicKey to EthereumAddress works is correct. (testPubKeyToEthAddress)', async() => {
    
    await testFunctions.testPubKeyToEthAddress();
  })


  it ('function dmdAddressToRipeResult', async() =>{
    // https://royalforkblog.github.io/2014/08/11/graphical-address-generator/
    // passphrase: bit.diamonds

    const address = '1Q9G4T5rLaf4Rz39WpkwGVM7e2jMxD2yRj';
    const expectedRipeResult = 'FDDACAAF7D90A0D7FC90106C3A64ED6E3A2CF859'.toLowerCase();
    const realRipeResult = cryptoJS.dmdAddressToRipeResult(address).toString('hex');
    assert.equal(realRipeResult, expectedRipeResult);

  })


  it('contract function (PublicKey to DMDAddress) (testPublicKeyToDMDAddress)', async() => {
    await testFunctions.testPublicKeyToDMDAddress();
  })

  it('Test Signing and Verification with Bitcoin Tool: testBitcoinMessageJS', async() => {
    //minimal test if the version of BitcoinMessageJS works as expected.
    testFunctions.testBitcoinMessageJS();
  })

  it('testMagicHash', async() => {
    await testFunctions.testMessageHashIsCorrect();
  })




  it('Retrieve Public Key from signature (testSignatureToXY)', async() => {
    
    await testFunctions.testSignatureToXY();
  })

  it('Retrieve Public Key from multiple signatures (testSignatureToXYMulti)', async() => {
    
    await testFunctions.testSignatureToXYMulti();
  })
  
    // it('Retrieve Bitcoin address from signature', async() => {
    
  //    await testFunctions.testAddressRecovery();
  // })


  it('ECRecover from Contracts matches expected Etherem/Bitcoin pseudo address', async() => {
      await testFunctions.testSolECRecover();
  })


  it('Validating signature in solidity', async() => {
    await testFunctions.testSignatureVerificationInContract();
  })


  it('deploying a new claim contract with claim to defined prefix', async () => {

    const claimToString = cryptoHelpers.stringToUTF8Hex('claim to ');
    claimContract = await ClaimContract.new(accounts[0], accounts[1], claimToString, callParams);
    testFunctions = new TestFunctions.TestFunctions(web3, claimContract.contract);
    cryptoSol = new CryptoSol.CryptoSol(web3, claimContract.contract);
  })

  it('Validating signature in solidity with defined prefix.', async() => {

    await testFunctions.testSignatureVerificationInContractDMD();
  })


  it('Validating signature in solidity with defined prefix and postfix', async() => {

    await testFunctions.testSignatureVerificationInContractPostfix();
  })

  
  it('adding balances', async() => {

    await testFunctions.testAddBalances();
  })


})
