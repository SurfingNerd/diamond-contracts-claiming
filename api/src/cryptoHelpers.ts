export function remove0x(input: string) {
  if (input.startsWith('0x')) {
    return input.substring(2);
  }
  return input;
}

export function ensure0xb32(input: string) : string {

  let buf = hexToBuf(input);

  if (buf.length == 32) {
    return input;
  }

  //let buf = new Buffer() 
  //while (buf.length < 32) {

  if (buf.length > 32) {
    // maybe the buffer starts with 0 ?
    throw Error("Hex strings greater then 32 byte are not supported");
  }

  let prefix = Buffer.alloc(32 - buf.length, 0);
  let resultBuf = Buffer.concat([prefix, buf]);
  return ensure0x(resultBuf);
}

export function ensure0x(input: string | Buffer) {

  if (input instanceof Buffer) {
    input = input.toString('hex');
  }

  if (!input.startsWith('0x')) {
    return '0x' + input;
  }
  return input;
}

export function toHexString(input: bigint) {
  return '0x' + input.toString(16);
}

export function hexToBuf(input: string): Buffer {
  if (input == null) {
    return Buffer.alloc(0);
  }

  return Buffer.from(remove0x(input), 'hex');
}

// appends a prefix to inputBuffer.
export function prefixBuf(inputBuffer: Buffer, prefixHexString: string) {
  const prefix = hexToBuf(prefixHexString);
  return Buffer.concat([prefix, inputBuffer]);
}


export function stringToUTF8Hex(input: string): string {
  return ensure0x(Buffer.from(input, 'utf8'));
}
