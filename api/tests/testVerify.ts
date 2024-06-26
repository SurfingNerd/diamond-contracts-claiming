//example address from bitcoin.
// Private: L4FkVsvM6FLuwJJHzpHJM6fUdG9acX5QqbvtvTSZRtG3Nsa7J8tv
// Public : 02bee3163c5ba877f4205ab447fb42373bb1f77e898d0d649dc7c691a483551a37
// PublicU: 04bee3163c5ba877f4205ab447fb42373bb1f77e898d0d649dc7c691a483551a378036be868fa5ec97c61b08073630c793ec550b77b28d96561ef9e89914b1e3a4
// Address: 1BzFQE9RWjNQEuN2pJTFEHN21LureERhKX

import { CryptoJS } from '../src/cryptoJS';


const message = "0x70A830C7EffF19c9Dd81Db87107f5Ea5804cbb3F";
//const signatureBase64 = "IHe2FvaAsIbIEvb47prSFg3rXNHlE91p2WYtpxIpPA30W6zgvzwc3wQ90nnA12LbL2aKo3a0jjgbN6xM7EOu/hE=";
const signatureBase64 = "HyrECQZOvOoOXzqbR27aDZndRQFiKIRdQ2aMT4hD2cxlFM8INib4pA9GNMwdUKST9q1P8SXi7tLQFh3go/lAgt0=";
const btcAddressBase64 = "1BzFQE9RWjNQEuN2pJTFEHN21LureERhKX";

//const sig = Buffer.from(signatureBase64, 'base64');
//const btcAddress = Buffer.from(btcAddressBase64, 'base64');

//r: 2077b616f680b086c812f6f8ee9ad2160deb5cd1e513dd69d9662da712293c0d
//s: f45bace0bf3c1cdf043dd279c0d762db2f668aa376b48e381b37ac4cec43aefe
//v: 17

// const r = sig.subarray(0, 32);
// const s = sig.subarray(32,64);
// const v = sig[64];

// console.log(`r: ${r.toString('hex')}`);
// console.log(`s: ${s.toString('hex')}`);
// console.log(`v: ${v}`);

//const hash = messageToHashToSign(message);

const js = new CryptoJS();
//const result = js.signatureBase64ToRSV(signatureBase64);
//console.log(result);

js.signatureBase64ToRSV("IJrCWpXrIj0of88WZdTmaZsQiVJVLdQQdr1cOZduJqAIpv2Zsy2tzJQH5RpxzUGqJUMHxw7rQrDTU/h5XL5S6S4=");
js.signatureBase64ToRSV("H0iAuj0/YmBQTh7bM+Zey3RMY2g8tBks/jvaR6FpSwInWRC+/gcKfqthtdhy/QnSmA08VBrAHkQTLTnGJQB6Hoo=");
js.signatureBase64ToRSV("IPyeuXgO6Non/Cm1O4mvBs8nGXCrP8/DWVIfpU5Vei4z1OYGEs4Kzc6eZGi4HwLypjNyg9iAkdYK77zC85YYWdI=");
js.signatureBase64ToRSV("H9QJKE0gzakMsVdPwJh3W5ih1R74yAgVgB0E6LCa5VkkKRViedLG9CmdjMslyYg9IBbVEXhpl+nMNXCxk5risSM=");
js.signatureBase64ToRSV("H1jYcZKFaYlMjqzleSA77kBpNwgytm+wG99j3ixHh08HraUT8HHYLTL0vxNVkc6DiJTwCPyrsEGr+SgKKa+T3ow=");
