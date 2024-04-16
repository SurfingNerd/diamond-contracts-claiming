export function getTestBalances() {
    return [
        { dmdv3Address: 'dceCTudsSHMmWMswUNezkYVhTSskG7rnYh', dmdv4Address: '0x9edD67cCFd52211d769A7A09b989d148749B1d10', value: '10000', signature: 'IDuuajA4vgGuu77fdoE0tntWP5TMGPLDO2VduTqE6wPKR2+fnF+JFD3LErn8vtqk81fL3qfjJChcrUnG5eTv/tQ=' },
        { dmdv3Address: 'dUcvB9CLL9BZAPU4hHG5LZAZbFmVdimXbV', dmdv4Address: '0xECDf6A57B12daB6aAb03bd93865dA0f24A5d95cd', value: '20000', signature: 'IO8kZpuH5Hpv9mMwCg8+Pw9JD/9MMal1CUEazFahs1LtKHgtspjWc2et7gIaSgmZLQArsCZIMPQ5hnBhp3pZpDs=' },
        { dmdv3Address: 'dDg7wr5zTxwPHWRmhLjzth5HCcRgSwABds', dmdv4Address: '0xC7dd948F88862a8a1A38DBdF29240e53d9e4aB6E', value: '100000', signature: 'IOXn3BffyymPz5kcqRhZ77tDxEDeN0VISZc8B2sTPJ3UBOmyXdpZt2qOEq8nUrtJgJA0GBAk8DFP4aahwzDoNs0=' },
        { dmdv3Address: 'dQQcrXm4888ffaf5AesQFeXFXTPPNRi7Wb', dmdv4Address: '0x30dF70ffd73e3C3d8406A79340dFB736c5533af3', value: '200000', signature: 'IBbRgp5wXepe9Rq8DX+psKx6C1IPoTX2Ibc13JcvkB72Fc7Um7LXd7vrdZrvjlNXLoqgXNH+h7EX4FMbNf6xuAM=' },
        { dmdv3Address: 'dZLJVFgkA7jEbbTeHjfmKc2a7naSvFatRo', dmdv4Address: '0x6FF1abA0F4a4dEdd990D3af8b95D8e8ed8F14cf8', value: '300000', signature: 'IDBNw+B8vzIVVEfRhORDYJegzAOe11pJtTTs8/ZSnjW/TdqxvwAYrfV5IOhpfelYNQzSYwyJxbCWodtMvtG2TjM=' },
        { dmdv3Address: 'dUuPsqEU5JqyKYSGRLhzQnYohiXDjMKEnQ', dmdv4Address: '0x03fC83270Ee8c65dAa39a87296Ec7685384F7Cb1', value: '400000', signature: 'H6+F5sUVxWbi329Eti/46/Z6CM1mH1tT0ptr4Hm5DVU6SfXyGejpwYJ1h4wQHtJDoj7UD3KeiJ+h9GyE/+lkepY=' },
    ];
}



// those balances have been created with a diamond-cli tool.
// and always use the same V3 address.
// those signatures should always result in the same public key.
// If used in adding balances or claiming balances, those  operations should fail, 
// because the values are either added or claimed already.
// creation hint:
// ./diamond-cli getnewaddress
// ./diamond-cli signmessage "dDdaBZRTDiybXrPvYdvKdydjsnbG3kfd11" "0xEb44B81852A2705701A59D454d1a33DA7a71E169"
// IChOonnXj+Mq2aJcQF8cQ+ZUfF22DcNB0mdQAO9GxyObbVl5XJHniGHVkSRgZJZU3qIt7uLkmAtGJCuOByF/e6g=
export function getTestBalances_DMD_cli_same_address() : TestBalances {
    let balances = [
        { dmdv3Address: 'dDdaBZRTDiybXrPvYdvKdydjsnbG3kfd11', dmdv4Address: '0xEb44B81852A2705701A59D454d1a33DA7a71E169', value: '10000', signature: 'IChOonnXj+Mq2aJcQF8cQ+ZUfF22DcNB0mdQAO9GxyObbVl5XJHniGHVkSRgZJZU3qIt7uLkmAtGJCuOByF/e6g=' },
        { dmdv3Address: 'dDdaBZRTDiybXrPvYdvKdydjsnbG3kfd11', dmdv4Address: '0x996E342F23693B625A41761479cc74d133792D0A', value: '10000', signature: 'H03UKIim1lQx9v/igL3bjt1fXGZUAHFWyboPOu2Y9/DFHcNI8sFfUSzUPvXh8crUlXxAOQtk+WAzO+CPsDdt+I8=' },
        { dmdv3Address: 'dDdaBZRTDiybXrPvYdvKdydjsnbG3kfd11', dmdv4Address: '0x3393C9F655C153B178978a2913844510b7EE40AE', value: '10000', signature: 'INU4te0lw1Tun2JCssY4xS3a8fkZEbdeW/U+f/2M5+T4aD6IKx/y7F1k4Rg7UBDsVGsEeLdR4uO7H2NyWmDphbc=' },
        { dmdv3Address: 'dDdaBZRTDiybXrPvYdvKdydjsnbG3kfd11', dmdv4Address: '0x39f2f917011bfa62071293a7095735BD4a0044eD', value: '10000', signature: 'IF6PriDQe9UUnWWLsITGxpq8kmQC8FtkIPtszYCnLdCuTK7dNWe82va69/z03YFhOlB8KhU2Kp8yo0dW0z4/Kfs=' },
    ];

    return {
        isDMDSigned: true,
        seedphrase: undefined, // we do not have a seedphrase for this test.
        messagePrefix: "",
        balances: balances
    }

}

// those balances have been created with a diamond-cli tool.
// example:
// ./diamond-cli getnewaddress
// ./diamond-cli signmessage "dDdaBZRTDiybXrPvYdvKdydjsnbG3kfd11" "0xEb44B81852A2705701A59D454d1a33DA7a71E169"
// IChOonnXj+Mq2aJcQF8cQ+ZUfF22DcNB0mdQAO9GxyObbVl5XJHniGHVkSRgZJZU3qIt7uLkmAtGJCuOByF/e6g=
export function getTestBalances_DMD_cli(): TestBalances {
    let balances = [
        { dmdv3Address: 'dFuGh7FqSp16YkCLJe24kb3DLvU35fm199', dmdv4Address: '0xC477BA27c63Cb22C023a1E41ae4a43ec9024b584', value: '10000', signature: 'H6jrO+Cq5VUrYgoRM/NmtxJxDLesG0gbzn1qvdaxPHwiWJA/ypgnbm8kyX2c+zEdRejr634wVZp2Q/d4W7Zu4fI=' },
        { dmdv3Address: 'dDdaBZRTDiybXrPvYdvKdydjsnbG3kfd11', dmdv4Address: '0xEb44B81852A2705701A59D454d1a33DA7a71E169', value: '10000', signature: 'IChOonnXj+Mq2aJcQF8cQ+ZUfF22DcNB0mdQAO9GxyObbVl5XJHniGHVkSRgZJZU3qIt7uLkmAtGJCuOByF/e6g=' },
    ];


    return {
        isDMDSigned: true,
        seedphrase: undefined, // we do not have a seedphrase for this test.
        messagePrefix: "",
        balances: balances
    }
}



export interface TestBalance {
    dmdv3Address: string;
    dmdv4Address: string;
    value: string;
    signature: string;
}

export interface TestBalances {
    // if true, the BTC signing prefix is used, otherwise the DMD signing prefix is used
    isDMDSigned: boolean;
    // the seedphrase used to sign the message, just in case for reconstructing the test.
    seedphrase: string | undefined;
    // the interlude of the message, Not the prefix used by the signing (isDMDSigned determines if BTC or DMD signing prefix is used)  
    messagePrefix: string;

    // the balances with signatures to test
    balances: TestBalance[];
}



export function getTestBalances_BTC() : TestBalances {
    // balances for 
    // const prefix = "";
    // const seedPhrase: "BTC claiming on DMDv4";
    // https://royalforkblog.github.io/2014/08/11/graphical-address-generator/
    
    let balances = [
        // this signature has 32 byte as R and S value length.
        { dmdv3Address: '13y2CTdWAdP8JuGWJUxUoPnWRZhdqjgYQF', dmdv4Address: '0x03fC83270Ee8c65dAa39a87296Ec7685384F7Cb1', value: '10000', signature: 'IJ+qCFWmxrZBS2gVNECVlaimliWKmxNK33/lEWn7nUn1CUxLTlqOp7bNKmq9hQuLA0j3/apqT4tkuYw4IrWMtUg=' },
    ];

    return {
        isDMDSigned: false,
        seedphrase: "BTC claiming on DMDv4",
        messagePrefix: "",
        balances: balances
    }
    
}

export function getTestBalances_DMD() {
    
    // balances for const prefix = "I want to claim my DMD Diamond V4 coins for the Testnet to the following address: ";
    let balances = [
        // this signature has 32 byte as R and S value length.
        {  dmdv3Address: 'dceCTudsSHMmWMswUNezkYVhTSskG7rnYh', dmdv4Address: '0x9edD67cCFd52211d769A7A09b989d148749B1d10', value: '10000', signature: 'IDuuajA4vgGuu77fdoE0tntWP5TMGPLDO2VduTqE6wPKR2+fnF+JFD3LErn8vtqk81fL3qfjJChcrUnG5eTv/tQ=' },
    ];

    return {
        isDMDSigned: true,
        seedphrase: undefined, // we do not have a seedphrase for this test.
        messagePrefix: "I want to claim my DMD Diamond V4 coins for the Testnet to the following address: ",
        balances: balances
    }
}