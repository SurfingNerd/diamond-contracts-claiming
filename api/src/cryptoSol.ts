import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { ClaimContract } from '../../typechain-types/index';

import { ensure0x, stringToUTF8Hex } from './cryptoHelpers';
import { CryptoJS } from './cryptoJS';
import { hexToBuf } from './cryptoHelpers';


/**
 * Crypto functions used in this project implemented in Soldity.
 */
export class CryptoSol {

  public cryptoJS = new CryptoJS();

  private logDebug: boolean = false;


  public static async fromContractAddress(contractAddress: string): Promise<CryptoSol> {


    //const contract : any = new web3.eth.Contract(abi, contractAddress);

    const contract = await ethers.getContractAt("ClaimContract", contractAddress);
    return new CryptoSol(contract);
  }

  public constructor(public instance: ClaimContract) {

    if (instance === undefined || instance === null) {
      throw Error("Claim contract must be defined!!");
    }
  }

  public setLogDebug(value: boolean) {
    this.logDebug = value;
    this.cryptoJS.setLogDebug(value);
  }

  private log(message: string, ...params: any[]) {
    if (this.logDebug) {
      console.log(message, ...params);
    }
  }


  public addressToHashToSign(address: string) {

  }

  /**
   * Retrieves the message that is used for hashing in bitcoin. (enpacking it with the Envolope)
   * see also: https://bitcoin.stackexchange.com/questions/77324/how-are-bitcoin-signed-messages-generated
   * @param address Ethereum style address, include checksum information.
   */
  public async addressToClaimMessage(address: string, postfix: string = ''): Promise<string> {

    const postfixHex = stringToUTF8Hex(postfix);

    const claimMessage = await this.instance.createClaimMessage(address, true, postfixHex);
    this.log('Claim Message:');
    this.log(claimMessage);
    return claimMessage;
  }

  public async messageToHash(messageString: string) {

    const buffer = Buffer.from(messageString, 'utf-8');

    const hash = await this.instance.calcHash256(buffer.toString('hex'), {});
    this.log('messageToHash');
    this.log(hash);
    return hash;
  }


  public async claimMessageMatchesSignature(
    claimToAddress: string,
    addressContainsChecksum: boolean,
    postfix: string,
    pubkeyX: string,
    pubkeyY: string,
    sigV: string,
    sigR: string,
    sigS: string):
    Promise<boolean> {
    const result =
      await this.instance.claimMessageMatchesSignature(
        claimToAddress,
        addressContainsChecksum,
        stringToUTF8Hex(postfix),
        ensure0x(pubkeyX),
        ensure0x(pubkeyY),
        ensure0x(sigV),
        ensure0x(sigR),
        ensure0x(sigS));
    this.log('Claim Result: ', result);
    return result;
  }

  public async getEthAddressFromSignature(
    claimToAddress: string,
    addressContainsChecksum: boolean,
    postfix: string,
    sigV: string,
    sigR: string | Buffer,
    sigS: string | Buffer)
    : Promise<string> {

    return this.instance.getEthAddressFromSignature(
      claimToAddress,
      addressContainsChecksum,
      stringToUTF8Hex(postfix),
      ensure0x(sigV),
      ensure0x(sigR),
      ensure0x(sigS)
    );
  }

  /**
   * returns the essential part of a Bitcoin-style legacy compressed address associated with the given ECDSA public key
   * @param x X coordinate of the ECDSA public key
   * @param y Y coordinate of the ECDSA public key
   * @returns Hex string holding the essential part of the legacy compressed address associated with the given ECDSA public key
   */
  async publicKeyToBitcoinAddressEssential(x: BigNumber, y: BigNumber): Promise<string> {
    const legacyCompressedEnumValue = 1;

    return this.instance.publicKeyToBitcoinAddress(
      x.toHexString(),
      y.toHexString(),
      legacyCompressedEnumValue
    );
  }

  async publicKeyToBitcoinAddress(x: BigNumber, y: BigNumber) {
    const essentialPart = await this.publicKeyToBitcoinAddressEssential(x, y);
    return this.cryptoJS.bitcoinAddressEssentialToFullQualifiedAddress(essentialPart, "00");
  }

  async publicKeyToDMDv3Address(x: BigNumber, y: BigNumber) {
    const essentialPart = await this.publicKeyToBitcoinAddressEssential(x, y);

    return this.cryptoJS.bitcoinAddressEssentialToFullQualifiedAddress(essentialPart, "0d");
  }

  public async pubKeyToEthAddress(x: string, y: string) {
    return this.instance.pubKeyToEthAddress(x, y);
  }

  public async prefixString() {

    const bytes = await this.instance.prefixStr();
    const buffer = hexToBuf(bytes);
    return new TextDecoder("utf-8").decode(buffer);

    //return stringToUTF8Hex
  }

  public async addBalance(dmdV3Address: string, value: string) {

    const signers = await ethers.getSigners();
    //const accounts = await this.web3Instance.eth.getAccounts();
    const fromAccount = signers[0];
    const ripe = this.cryptoJS.dmdAddressToRipeResult(dmdV3Address);

    await this.instance.connect(fromAccount).addBalance(ensure0x(ripe), { value: value });
  }

  public async getBalance(dmdV3Address: string) {

    const ripe = this.cryptoJS.dmdAddressToRipeResult(dmdV3Address);
    return await this.instance.balances(ensure0x(ripe));
  }

  public async getContractBalance() {
    const address = this.instance.address;
    // get the balance of ths address.

    return await ethers.provider.getBalance(address);
  }
}
