import bs58check from 'bs58check';
import EC from 'elliptic'
import BN from 'bn.js';
import { ensure0x, hexToBuf, prefixBuf, remove0x } from './cryptoHelpers';
import varuint from 'varuint-bitcoin';

//import { toBase58Check, fromBase58Check } from 'bitcoinjs-lib/types/address';
//var bs58check = require('bs58check');

import bitcoinMessage from 'bitcoinjs-message';
import * as bitcoin from 'bitcoinjs-lib';

// const secp256k1 = require('secp256k1')

import * as secp256k1 from "secp256k1";
import { ethers } from 'hardhat';

const SEGWIT_TYPES = {
  P2WPKH: 'p2wpkh',
  P2SH_P2WPKH: 'p2sh(p2wpkh)'
}


/**
 * Crypto functions used in this project implemented in JS.
 */
export class CryptoJS {


  

  private logDebug: boolean = false;

  public constructor() {

  }

  public setLogDebug(value: boolean) {
    this.logDebug = value;
  }

  private log(message: string, ...params: any[]) {
    if (this.logDebug) {
      console.log(message, ...params);
    }
  }

  /**
   * returns the DMD Diamond V3 address from the public key.
   * @param x x coordinate of the public key, with prefix 0x
   * @param y y coordinate of the public key, with prefix 0x
   */
  public publicKeyToBitcoinAddress(publicKey: string): string {
    
    // const hash = bitcoinMessage.magicHash(publicKeyBuffer, CryptoJS.getSignaturePrefix(false));
    // const publicKey = secp256k1.publicKeyConvert(publicKeyBuffer, true);
    //const address = bitcoinMessage.pubKeyToAddress(publicKey, true);
    //return address;


    //const publicKeyBuffer = Buffer.from(x.slice(2) + y.slice(2), 'hex');

    const pubkey = Buffer.from( remove0x(publicKey), 'hex' );
    const { address } = bitcoin.payments.p2pkh({ pubkey });

    return address!;
    // todo: support DMD here
    let network = bitcoin.networks.bitcoin;

    //return bitcoin.address.fromOutputScript(publicKeyBuffer, network);
    // Parse the public key
    //const publicKey = Buffer.from(publicKeyBuffer);

    // Generate the Bitcoin address
    //const { address } = bitcoin.payments.p2pkh({ pubkey: publicKeyBuffer });


  }
    


  /**
   *
   * @param address dmd or bitcoin style address.
   * @return Buffer with the significant bytes of the public key, not including the version number prefix, or the checksum postfix.
   */
  public dmdAddressToRipeResult(address: string): Buffer {
    this.log('address:', address);
    const decoded = bs58check.decode(address);

    // Assume first byte is version number
    let buffer = Buffer.from(decoded.slice(1));
    return buffer;
  }

  public signatureBase64ToRSV(signatureBase64: string): { r: Buffer, s: Buffer, v: number } {
    //var ec = new EC.ec('secp256k1');

    //const input = new EC. SignatureInput();


    // const signature = new EC.ec.Signature(signatureBase64, 'base64');

    // const rr = signature.r.toBuffer();
    // const ss = signature.s.toBuffer();
    // const vv = signature.recoveryParam;

    // this.log(`r: ${rr.toString('hex')}`);
    // this.log(`s: ${ss.toString('hex')}`);
    // this.log(`v: ${vv}`);

    // return { r: rr, s: ss, v: vv};

    // where is the encoding of the signature documented ?
    //is that DER encoding ? Or the Significant part of DER ?

    const sig = Buffer.from(signatureBase64, 'base64');

    this.log('sigBuffer:');
    this.log(sig.toString('hex'));

    //thesis:
    // 20 is a header, and v is not included in the signature ?
    const sizeOfRComponent = sig[0];
    this.log('sizeOfR:', sizeOfRComponent);

    const rStart = 1; // r Start is always one (1).
    const sStart = 1 + sizeOfRComponent;
    const sizeOfSComponent = sig.length - sStart;
    this.log('sizeOfS:', sizeOfSComponent);

    if (sizeOfRComponent > sig.length) {
      throw new Error('sizeOfRComponent is too Big!!');
    }
    const r = sig.subarray(rStart, rStart + sizeOfRComponent);
    const s = sig.subarray(sStart, 65);
    const v = 0; //sig[64];

    this.log(`r: ${r.toString('hex')}`);
    this.log(`s: ${s.toString('hex')}`);
    this.log(`v: ${v}`);

    return { r, s, v };
  }


  public decodeSignature(buffer: Buffer) {

    if (buffer.length !== 65) throw new Error('Invalid signature length')

    const flagByte = buffer.readUInt8(0) - 27
    if (flagByte > 15 || flagByte < 0) {
      throw new Error('Invalid signature parameter')
    }

    return {
      compressed: !!(flagByte & 12),
      segwitType: !(flagByte & 8)
        ? null
        : !(flagByte & 4)
          ? SEGWIT_TYPES.P2SH_P2WPKH
          : SEGWIT_TYPES.P2WPKH,
      recovery: flagByte & 3,
      signature: buffer.slice(1)
    }
  }


  public getPublicKeyFromSignature(signatureBase64: string, messageContent: string, isDMDSigned: boolean): { publicKey: string, x: string, y: string } {

    //const signatureBase64 = "IBHr8AT4TZrOQSohdQhZEJmv65ZYiPzHhkOxNaOpl1wKM/2FWpraeT8L9TaphHI1zt5bI3pkqxdWGcUoUw0/lTo=";
    //const address = "";

    const signature = Buffer.from(signatureBase64, 'base64');

    const parsed = this.decodeSignature(signature);
    //this.log('parsed Signature:', parsed);

    // todo: add support for DMD specific signing prefix
    const hash = bitcoinMessage.magicHash(messageContent, CryptoJS.getSignaturePrefix(isDMDSigned));

    
    const publicKey = secp256k1.ecdsaRecover(
      parsed.signature,
      parsed.recovery,
      hash,
      parsed.compressed
    );

    //we now have the public key
    //public key is the X Value with a prefix.
    //it's 02 or 03 prefix, depending if y is ODD or not.
    this.log("publicKey: ", ethers.hexlify(publicKey));

  

    var ec = new EC.ec('secp256k1');

    const key = ec.keyFromPublic(publicKey);
    //const x = ethers.hexlify(publicKey.slice(1));
    //this.log("x: " + x);
    const x = ensure0x(key.getPublic().getX().toString('hex'));
    const y = ensure0x(key.getPublic().getY().toString('hex'));

    
    this.log("y: " + y);

    return { publicKey: ethers.hexlify(publicKey), x, y };
  }


  public getXYfromPublicKeyHex(publicKeyHex: string): { x: BN; y: BN; } {
    var ec = new EC.ec('secp256k1');
    var publicKey = ec.keyFromPublic(publicKeyHex.toLowerCase(), 'hex').getPublic();
    var x = publicKey.getX();
    var y = publicKey.getY();

    //this.log("pub key:" + publicKey.toString('hex'));
    //this.log("x :" + x.toString('hex'));
    //this.log("y :" + y.toString('hex'));
    return { x, y };
  }

  public bitcoinAddressEssentialToFullQualifiedAddress(essentialPart: string, addressPrefix = '00') {

    // this.log('PublicKeyToBitcoinAddress:', essentialPart);
    let result = hexToBuf(essentialPart);
    result = prefixBuf(result, addressPrefix);
    //this.log('with prefix: ' + result.toString('hex'));

    return bs58check.encode(result);

  }

  public getSignedMessage(messagePrefix: string, message: string): Buffer {

    const messagePrefixBuffer = Buffer.from(messagePrefix, 'utf8');;
    const messageBuffer = Buffer.from(message, 'utf8');
    const messageVISize = varuint.encodingLength(message.length);

    const buffer = Buffer.alloc(
      messagePrefix.length + messageVISize + message.length
    );

    messagePrefixBuffer.copy(buffer, 0);
    varuint.encode(message.length, buffer, messagePrefix.length);
    messageBuffer.copy(buffer, messagePrefix.length + messageVISize);
    return buffer;
  }

  public static getSignaturePrefix(isDMDSigned: boolean): string {
    return isDMDSigned ? '\u0018Diamond Signed Message:\n' : '\u0018Bitcoin Signed Message:\n';
  }
  
  public getDMDSignedMessage(message: string): Buffer  {
    return this.getSignedMessage(CryptoJS.getSignaturePrefix(true), message);
  }


  public getBitcoinSignedMessage(message: string): Buffer  {
    return this.getSignedMessage(CryptoJS.getSignaturePrefix(false), message);
  }

}
