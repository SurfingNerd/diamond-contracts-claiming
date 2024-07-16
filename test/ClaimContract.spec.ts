import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";

import EC from "elliptic";
import BN from "bn.js";

import { ClaimContract } from "../typechain-types";
import { CryptoJS } from "../api/src/cryptoJS";
import { ensure0x, hexToBuf, remove0x, stringToUTF8Hex } from "../api/src/cryptoHelpers";
import { getTestSignatures } from "./fixtures/signature";
import { getTestBalances, getTestBalances_DMD_cli_same_address, getTestBalances_DMD_cli, getTestBalances_DMD_with_prefix, getTestBalances_dillution } from "./fixtures/balances";
import { CryptoSol } from "../api/src/cryptoSol";
import { ClaimingDataSet } from "../api/data/interfaces";


function getDilluteTimestamps(): { dillute1: number, dillute2: number, dillute3: number } {
    let now = Math.floor(Date.now() / 1000);
    let dillute1 = now + (86400 * 2 * 31) + 86400 * 30;
    let dillute2 = now + (86400 * 3 * 31) + (86400 * 3 * 30);
    let dillute3 = now + (86400 * 4 * 365) + (86400 * 366);
    return { dillute1, dillute2, dillute3 };

}

describe('ClaimContract', () => {
    let signers: SignerWithAddress[];

    let lateClaimBeneficorAddress: string;
    let lateClaimBeneficorDAO: string;

    let cryptoJS: CryptoJS;

    async function deployClaiming(claimBeneficorAddress: string, beneficorDAOAddress: string, prefix: string) {
        const contractFactory = await ethers.getContractFactory("ClaimContract");
        let dilluteTimestamps = getDilluteTimestamps();
        let prefixHex = stringToUTF8Hex(prefix);

        const claimContract = await contractFactory.deploy(claimBeneficorAddress, beneficorDAOAddress, prefixHex, dilluteTimestamps.dillute1, dilluteTimestamps.dillute2, dilluteTimestamps.dillute3);
        await claimContract.waitForDeployment();

        // why we need to bypass type checks here ?
        return (claimContract as any) as ClaimContract;
    }

    async function deployFixtureWithNoPrefix(): Promise<{ claimContract: ClaimContract }> {
        return deployFixture('');
    }

    async function deployFixture(prefixHex: string): Promise<{ claimContract: ClaimContract }> {

        let claimContract = await deployClaiming(lateClaimBeneficorAddress, lateClaimBeneficorDAO, prefixHex);
        return { claimContract };
    }

    async function verifySignature(claimContract: ClaimContract, claimToAddress: string, signatureBase64: string, postfix: string = '') {


        const prefixBytes = await claimContract.prefixStr();
        const prefixBuffer = hexToBuf(prefixBytes);

        const prefixString = new TextDecoder("utf-8").decode(prefixBuffer);

        const key = cryptoJS.getPublicKeyFromSignature(signatureBase64, prefixString + claimToAddress + postfix, true);
        const rs = cryptoJS.signatureBase64ToRSV(signatureBase64);

        const txResult1 =
            await claimContract.claimMessageMatchesSignature(
                claimToAddress,
                stringToUTF8Hex(postfix),
                ensure0x(key.x),
                ensure0x(key.y),
                ensure0x('0x1b'),
                ensure0x(rs.r.toString('hex')),
                ensure0x(rs.s.toString('hex'))
            );

        const txResult2 =
            await claimContract.claimMessageMatchesSignature(
                claimToAddress,
                stringToUTF8Hex(postfix),
                ensure0x(key.x),
                ensure0x(key.y),
                ensure0x('0x1c'),
                ensure0x(rs.r.toString('hex')),
                ensure0x(rs.s.toString('hex'))
            );

        expect(txResult1 || txResult2).to.be.equal(true, "Claim message did not match the signature");
    }

    before(async () => {
        signers = await ethers.getSigners();

        lateClaimBeneficorAddress = signers[0].address;
        lateClaimBeneficorDAO = signers[1].address;

        cryptoJS = new CryptoJS();
    });

    describe("deployment", () => {
        it('should revert deploy with beneficor address = 0x0', async () => {
            const contractFactory = await ethers.getContractFactory("ClaimContract");


            let dilluteTimestamps = getDilluteTimestamps();
            await expect(
                contractFactory.deploy(ethers.ZeroAddress, lateClaimBeneficorDAO, '0x', dilluteTimestamps.dillute1, dilluteTimestamps.dillute2, dilluteTimestamps.dillute3)
            ).to.be.revertedWith("Beneficor Address Reinsert Pot must not be 0x0");
        });

        it('should revert deploy with beneficior DAO address = 0x0', async () => {
            const contractFactory = await ethers.getContractFactory("ClaimContract");
            let dilluteTimestamps = getDilluteTimestamps();
            await expect(
                contractFactory.deploy(lateClaimBeneficorAddress, ethers.ZeroAddress, '0x', dilluteTimestamps.dillute1, dilluteTimestamps.dillute2, dilluteTimestamps.dillute3)
            ).to.be.revertedWith("Beneficor Address DAO must not be 0x0");
        });

        it('should deploy contract', async () => {
            const contractFactory = await ethers.getContractFactory("ClaimContract");

            // get current timestamp:
            // dillute1 =  deploymentTimestamp + (1 days * 2 * 31) + 1 days * 30;
            // dillute2 =  deploymentTimestamp + (1 days * 3 * 31) + (1 days * 3 * 30);
            // dillute3 =  deploymentTimestamp + (YEAR_IN_SECONDS * 4) + LEAP_YEAR_IN_SECONDS;

            let dilluteTimestamps = getDilluteTimestamps();

            const contract = await contractFactory.deploy(
                lateClaimBeneficorAddress,
                lateClaimBeneficorDAO,
                '0x',
                dilluteTimestamps.dillute1,
                dilluteTimestamps.dillute2,
                dilluteTimestamps.dillute3
            );


            expect(await contract.waitForDeployment());
        });
    });

    describe("cryptographics", () => {
        it('should correctly calculate address checksum', async () => {
            const { claimContract } = await helpers.loadFixture(deployFixtureWithNoPrefix);

            const address = '0xfec7b00dc0192319dda0c777a9f04e47dc49bd18';
            const addressWithChecksum = '0xfEc7B00DC0192319DdA0c777A9F04E47Dc49bD18';

            const calcAddressResult = await claimContract.calculateAddressString(address);

            const buffer = Buffer.from(remove0x(calcAddressResult), 'hex');
            const calcResult = buffer.toString('utf8');

            expect(calcResult).to.be.equal(addressWithChecksum, 'checksum must be calculated in a correct ways.');
        });

        it('should create correct claim message', async () => {
            const { claimContract } = await helpers.loadFixture(deployFixtureWithNoPrefix);

            const address = '0x70A830C7EffF19c9Dd81Db87107f5Ea5804cbb3F';
            const resultJS = ensure0x(cryptoJS.getDMDSignedMessage(address).toString('hex'));

            const postfixHex = stringToUTF8Hex('');
            const result = await claimContract.createClaimMessage(address, postfixHex);

            expect(result).to.be.equal(resultJS);
        });


        it('should create correct claim message dmd with prefix', async () => {
            const { claimContract } = await helpers.loadFixture(deployFixtureWithNoPrefix);

            const prefix = '';
            const address = '0x70A830C7EffF19c9Dd81Db87107f5Ea5804cbb3F';
            const resultJS = ensure0x(cryptoJS.getDMDSignedMessage(prefix + address).toString('hex'));

            const postfixHex = stringToUTF8Hex('');
            const result = await claimContract.createClaimMessage(address, postfixHex);

            expect(result).to.be.equal(resultJS);
        });


        it('should convert pub key to eth address', async () => {
            const { claimContract } = await helpers.loadFixture(deployFixtureWithNoPrefix);

            // BIP39 Mnemonic: "hello slim hope" - really, i got this Mnemonic from RNG...
            // address 0: 0x7af37454aCaB6dB76c11bd33C94ED7C0b7A60B2a
            // Public:    0x03ff2e6a372d6beec3b02556971bfc87b9fb2d7e27fe99398c11693571080310d8
            // Private:   0xc99dd56045c449952e16388925455cc32e4eb180f2a9c3d2afd587aaf1cceda5

            const expectedAddress = '0x7af37454aCaB6dB76c11bd33C94ED7C0b7A60B2a';
            const inputPrivateKey = 'c99dd56045c449952e16388925455cc32e4eb180f2a9c3d2afd587aaf1cceda5';

            var ec = new EC.ec('secp256k1');
            var G = ec.g; // Generator point
            var pk = new BN(inputPrivateKey, 'hex'); // private key as big number
            var pubPoint = G.mul(pk); // EC multiplication to determine public point

            var x = pubPoint.getX().toBuffer(); //32 bit x co-ordinate of public point
            var y = pubPoint.getY().toBuffer(); //32 bit y co-ordinate of public point

            const result = await claimContract.pubKeyToEthAddress(x, y);

            expect(result).to.equal(expectedAddress);
        });

        it('should convert BTC address to RIPE result', async () => {
            // https://royalforkblog.github.io/2014/08/11/graphical-address-generator/
            // passphrase: bit.diamonds

            const address = '1Q9G4T5rLaf4Rz39WpkwGVM7e2jMxD2yRj';

            const expectedRipeResult = 'FDDACAAF7D90A0D7FC90106C3A64ED6E3A2CF859'.toLowerCase();
            const realRipeResult = cryptoJS.dmdAddressToRipeResult(address).toString('hex');

            expect(realRipeResult).to.equal(expectedRipeResult);
        });

        it('should convert public key to to Bitcoin Address', async () => {
            const { claimContract } = await helpers.loadFixture(deployFixtureWithNoPrefix);

            // https://royalforkblog.github.io/2014/08/11/graphical-address-generator/
            // passphrase: bit.diamonds
            const publicKeyHex = '035EF44A6382FABDCB62425D68A0C61998881A1417B9ED068513310DBAE8C61040';
            const expectedAddress = '1Q9G4T5rLaf4Rz39WpkwGVM7e2jMxD2yRj';

            const { x, y } = cryptoJS.getXYfromPublicKeyHex(publicKeyHex);



            const essentialPart = await claimContract.publicKeyToBitcoinAddress(
                ensure0x(x.toString('hex')),
                ensure0x(y.toString('hex'))
            );

            const bs58Result = cryptoJS.bitcoinAddressEssentialToFullQualifiedAddress(
                essentialPart,
                '00'
            );

            expect(bs58Result).to.equal(expectedAddress);

            console.log();
            // we are also cross checking the result with the result from the cryptoJS library,
            // (that uses bitcoin payments internaly to verify)
            const addressFromCryptJS = cryptoJS.publicKeyToBitcoinAddress(publicKeyHex);
            expect(bs58Result).to.equal(addressFromCryptJS);
        });

        it('JS: should recover public key from signature', async () => {
            //https://royalforkblog.github.io/2014/08/11/graphical-address-generator/
            //passphrase: bit.diamonds

            const message = "0x70A830C7EffF19c9Dd81Db87107f5Ea5804cbb3F";
            const signatureBase64 = "IBHr8AT4TZrOQSohdQhZEJmv65ZYiPzHhkOxNaOpl1wKM/2FWpraeT8L9TaphHI1zt5bI3pkqxdWGcUoUw0/lTo=";
            const key = cryptoJS.getPublicKeyFromSignature(signatureBase64, message, false);

            expect(key.x).equal("0x5EF44A6382FABDCB62425D68A0C61998881A1417B9ED068513310DBAE8C61040".toLowerCase());
            expect(key.y).equal("0x99523EB43291A1067FA819AA5A74F30810B19D15F6EDC19C9D8AA525B0F6C683".toLowerCase());
            expect(key.publicKey).equal("0x035EF44A6382FABDCB62425D68A0C61998881A1417B9ED068513310DBAE8C61040".toLowerCase());
        });

        it('JS: should recover public key from signatures, test signatures set.', async () => {
            // Same test as previous
            // But with multi signatures of the same key.
            // in order to cover different signatures variations,
            // like short S and short R

            // https://royalforkblog.github.io/2014/08/11/graphical-address-generator/
            // passphrase: bit.diamonds

            // signatures created with: https://reinproject.org/bitcoin-signature-tool/#sign

            const message = "0x70A830C7EffF19c9Dd81Db87107f5Ea5804cbb3F";
            const signaturesBase64 = getTestSignatures();

            for (let index = 0; index < signaturesBase64.length; index++) {
                const signatureBase64 = signaturesBase64[index];
                const key = cryptoJS.getPublicKeyFromSignature(signatureBase64, message, false);

                expect(key.x).equal("0x5EF44A6382FABDCB62425D68A0C61998881A1417B9ED068513310DBAE8C61040".toLowerCase());
                expect(key.y).equal("0x99523EB43291A1067FA819AA5A74F30810B19D15F6EDC19C9D8AA525B0F6C683".toLowerCase());
                expect(key.publicKey).equal("0x035EF44A6382FABDCB62425D68A0C61998881A1417B9ED068513310DBAE8C61040".toLowerCase());
            }
        });

        async function runAddAndClaimTests(testSet: ClaimingDataSet) {

            let deployFixtureSpecified = () => {
                return deployFixture(testSet.messagePrefix);
            };

            const { claimContract } = await helpers.loadFixture(deployFixtureSpecified);
            const caller = signers[0];
            const balances = testSet;

            let cryptoSol = new CryptoSol(claimContract);

            for (const balance of balances.balances) {
                const ripeAddress = ensure0x(cryptoJS.dmdAddressToRipeResult(balance.dmdv3Address));
                // cryptoSol.addBalance(balance.dmdv3Address, balance.value);
                await claimContract.connect(caller).addBalance(ripeAddress, { value: balance.value });
                const currentBalance = await claimContract.balances(ripeAddress);
                expect(currentBalance).to.equal(balance.value, 'Balance of DMDv3 adress matches defined Balance.');
            }

            for (const balance of balances.balances) {
                let balanceBeforeClaim = await ethers.provider.getBalance(balance.dmdv4Address);
                await cryptoSol.claim(balance.dmdv3Address, balance.dmdv4Address, balance.signature, "");
                let balanceAfterClaim = await ethers.provider.getBalance(balance.dmdv4Address);

                let expectedBalance = ethers.toBigInt(balance.value) + balanceBeforeClaim;
                expect(balanceAfterClaim).to.equal(expectedBalance, 'Balance of DMDv4 adress matches defined Balance.');
            }
        }

        describe("cryptographics with defined message prefix", async function () {
            const claimToString = stringToUTF8Hex('claim to ');

            async function deployWithPrefixFixture(): Promise<{ claimContract: ClaimContract }> {
                const claimContract = await deployClaiming(
                    lateClaimBeneficorAddress,
                    lateClaimBeneficorDAO,
                    claimToString
                );

                return { claimContract };
            }

            it('should validate signature defined prefix and postfix', async () => {
                const { claimContract } = await helpers.loadFixture(deployWithPrefixFixture);

                const claimToAddress = "0x9edD67cCFd52211d769A7A09b989d148749B1d10";
                const signatureBase64 = "IIQYAZ+4Tf7bdw9UX72adTvH80vz2igEABRnwElSy1ZvZGICcqX8bYw6e9LZ+QPrKW4VIJrA9cZJhR3cSCt8BAc=";

                const suffixString = ' test suffix 123';

                await verifySignature(claimContract, claimToAddress, signatureBase64, suffixString);
            }).skip() // skipping: we need proper signatures after remove bitcoin support https://github.com/DMDcoin/diamond-contracts-claiming/issues/22;
        });

        describe("balance", async function () {

            it('should correctly add balances', async () => {
                const { claimContract } = await helpers.loadFixture(deployFixtureWithNoPrefix);

                const claimContractAddress = await claimContract.getAddress();
                const caller = signers[0];
                const balances = getTestBalances();

                let expectedTotalBalance = ethers.toBigInt('0');

                for (const balance of balances) {

                    const ripeAddress = ensure0x(cryptoJS.dmdAddressToRipeResult(balance.dmdv3Address));
                    await claimContract.connect(caller).addBalance(ripeAddress, { value: balance.value });
                    expectedTotalBalance = expectedTotalBalance + ethers.toBigInt(balance.value);
                    const currentBalance = await claimContract.balances(ripeAddress);
                    expect(currentBalance).to.equal(balance.value, 'Balance of DMDv3 adress matches defined Balance.');
                }

                const totalBalance = await ethers.provider.getBalance(claimContractAddress);
                expect(totalBalance).to.equal(expectedTotalBalance, 'Balance of contract should be the total of all added funds.');
            });

            it('fill() a balance testset', async () => {
                let deployFreshFixtureForBalanceTest = () => deployFixtureWithNoPrefix();
                const { claimContract } = await helpers.loadFixture(deployFreshFixtureForBalanceTest);

                const caller = signers[0];
                const testbalances = getTestBalances();

                let cryptoSol = new CryptoSol(claimContract);


                let expectedTotalBalance = await cryptoSol.fillBalances(claimContract, caller, testbalances);

                const totalBalance = await ethers.provider.getBalance(await claimContract.getAddress());
                expect(totalBalance).to.equal(expectedTotalBalance, 'Balance of contract should be the total of all added funds.');

                for (const balance of testbalances) {
                    const currentBalance = await claimContract.balances(cryptoJS.dmdAddressToRipeResult(balance.dmdv3Address));
                    expect(currentBalance.toString()).to.equal(balance.value, 'Balance of DMDv3 adress matches defined Balance.');
                }
            });
        });

        describe("dilution", async function () {

            // it("dilute a testset", async () => {

            //     let testbalances = getTestBalances_BTC();

            //     for (let balance of testbalances.balances) {
            //         balance.value
            //     }
            // });

            // DMD claiming is known to fail.
            // it("claiming DMD", async () => {
            //     await runAddAndClaimTests(getTestBalances_DMD());
            // });
        });

        //             117.869,94
        // 70.721,96
        // 165.017,91

        describe("DMD Diamond", async function () {
            it("DMD Signatures from same address point to same public key.", async () => {

                let testset = getTestBalances_DMD_cli_same_address();
                let x = "";
                let y = "";

                const { claimContract } = await helpers.loadFixture(deployFixtureWithNoPrefix);
                //let cryptoSol = new CryptoSol(claimContract);

                for (let balance of testset.balances) {

                    let key = cryptoJS.getPublicKeyFromSignature(balance.signature, balance.dmdv4Address, testset.isDMDSigned);

                    //cryptoJS.publicKeyToBTCStyleAddress(key.x, key.y, true);
                    //cryptoJS.bitcoinAddressEssentialToFullQualifiedAddress()
                    if (x === "") {

                        x = key.x;
                        y = key.y;
                    } else {
                        expect(x).to.equal(key.x, "Public key is not the same for all signatures.");
                        expect(y).to.equal(key.y, "Public key is not the same for all signatures.");
                    }
                }
            });

            it("rejecting double add balances for defined DMD address", async () => {
                await expect(runAddAndClaimTests(getTestBalances_DMD_cli_same_address())).to.rejectedWith("There is already a balance defined for this old address");
            });

            it("DMD address building from ripe.", async () => {
                let balances = getTestBalances();

                for (let balance of balances) {
                    const ripeResult = cryptoJS.dmdAddressToRipeResult(balance.dmdv3Address);
                    const dmdAddressFromRipe = cryptoJS.ripeToDMDAddress(ripeResult);
                    expect(dmdAddressFromRipe).to.equal(balance.dmdv3Address);
                }
            });
        });


        describe("claiming", async function () {

            // DMD claiming is known to fail.
            it("claiming DMD", async () => {
                await runAddAndClaimTests(getTestBalances_DMD_cli());
            });

            it("claiming DMD with prefix", async () => {
                await runAddAndClaimTests(getTestBalances_DMD_with_prefix());
            });
        });

        describe("Dilution", function () {
            let claimContract: ClaimContract;
            let sponsor: SignerWithAddress;
            let beneficorReinsertPot: SignerWithAddress;
            let beneficorDAO: SignerWithAddress;
            let totalAmountInClaimingPot: bigint = BigInt(0);  
    
            //const ONE_DAY = 86400n;
            //const ETHER = BigInt(10n ** 18n);
    
            beforeEach(async function () {

                
            });
    
            it("should dilute balances and pay out correctly", async function () {
    
                [sponsor, beneficorReinsertPot, beneficorDAO] = await ethers.getSigners();
    
                let testBalances = getTestBalances_dillution();
    
                claimContract = (await deployFixture(testBalances.messagePrefix)).claimContract;

                let sol = new CryptoSol(claimContract);
                totalAmountInClaimingPot = await sol.fillBalances(claimContract,sponsor, testBalances.balances);

                // Try to dilute before first dilution period - should fail
                await expect(claimContract.dilute1()).to.be.revertedWith(
                    "dilute1 can only get called after the treshold timestamp got reached."
                );

                let now = await claimContract.deploymentTimestamp();

                let claimingBalances = getTestBalances_dillution();
                const [claimersEarly, claimersMid, claimersLate] = claimingBalances.balances;

                let claimResultNullable = await sol.claim(claimersEarly.dmdv3Address, claimersEarly.dmdv4Address, claimersEarly.signature, "");
                expect(claimResultNullable !== null, "claim result should never be null");
                let claimResult = claimResultNullable!;
                expect(claimResult.status === 0, "claiming should succed.");
                
                // does the early claimer have the exact amount of coins than he should have ?
                let earlyClaimerBalance = await ethers.provider.getBalance(claimersEarly.dmdv4Address);
                expect(earlyClaimerBalance).to.be.equal(BigInt(claimersEarly.value));

                // a second claim must not be possible.
                await expect(sol.claim(claimersEarly.dmdv3Address, claimersEarly.dmdv4Address, claimersEarly.signature, "")).to.be.revertedWith("provided address does not have a balance.");

                //await sol.claim(claimersEarly.dmdv3Address, claimersEarly.dmdv4Address, claimersEarly.signature, "");
                
                // Fast forward time to after first dilution period
                //await ethers.provider.send("evm_increaseTime", [Number(ONE_DAY) + 1]);
                //await ethers.provider.send("evm_mine", []);
    

                
                // // Trigger first dilution
                // const tx1 = await claimContract.dilute1();
                // const receipt1 = await tx1.wait();
                // expect(receipt1.status).to.equal(1);
    
                // await expect(claimContract.dilute1()).to.be.revertedWith(
                //     "dilute1 event already happened."
                // );
    
    
                // // Check balances after first dilution
                // const balanceAfterDilute1User1 = BigInt(await claimContract.balances(ethers.utils.hexZeroPad(user1.address, 20)));
                // const balanceAfterDilute1User2 = BigInt(await claimContract.balances(ethers.utils.hexZeroPad(user2.address, 20)));
                // expect(balanceAfterDilute1User1).to.equal(75n * ETHER); // 75% of 100
                // expect(balanceAfterDilute1User2).to.equal(150n * ETHER); // 75% of 200
    
                // // Check beneficiary balances increased correctly
                // const balanceReinsertPotAfterDilute1 = BigInt(await ethers.provider.getBalance(beneficorReinsertPot.address));
                // const balanceDAOAfterDilute1 = BigInt(await ethers.provider.getBalance(beneficorDAO.address));
                // expect(balanceReinsertPotAfterDilute1 - initialBalanceReinsertPot).to.equal(37n * ETHER + 500n * (ETHER / 1000n)); // (25% of 300) / 2
                // expect(balanceDAOAfterDilute1 - initialBalanceDAO).to.equal(37n * ETHER + 500n * (ETHER / 1000n)); // (25% of 300) / 2
    
                // // Try to dilute1 again - should fail
                // await expect(claimContract.dilute1()).to.be.revertedWith("dilute1 event did already happen!");
    
                // // Fast forward time to second dilution period
                // await ethers.provider.send("evm_increaseTime", [Number(ONE_DAY)]);
                // await ethers.provider.send("evm_mine", []);
    
                // // Trigger second dilution
                // const tx2 = await claimContract.dilute2();
                // const receipt2 = await tx2.wait();
                // expect(receipt2.status).to.equal(1);
    
                // // Check balances after second dilution
                // const balanceAfterDilute2User1 = BigInt(await claimContract.balances(ethers.utils.hexZeroPad(user1.address, 20)));
                // const balanceAfterDilute2User2 = BigInt(await claimContract.balances(ethers.utils.hexZeroPad(user2.address, 20)));
                // expect(balanceAfterDilute2User1).to.equal(50n * ETHER); // 50% of 100
                // expect(balanceAfterDilute2User2).to.equal(100n * ETHER); // 50% of 200
    
                // // Fast forward time to third dilution period
                // await ethers.provider.send("evm_increaseTime", [Number(ONE_DAY)]);
                // await ethers.provider.send("evm_mine", []);
    
                // // Trigger third dilution
                // const tx3 = await claimContract.dilute3();
                // const receipt3 = await tx3.wait();
                // expect(receipt3.status).to.equal(1);
    
                // // Check balances after third dilution
                // const balanceAfterDilute3User1 = BigInt(await claimContract.balances(ethers.utils.hexZeroPad(user1.address, 20)));
                // const balanceAfterDilute3User2 = BigInt(await claimContract.balances(ethers.utils.hexZeroPad(user2.address, 20)));
                // expect(balanceAfterDilute3User1).to.equal(0n); // 0% of 100
                // expect(balanceAfterDilute3User2).to.equal(0n); // 0% of 200
    
                // // Check final beneficiary balances
                // const finalBalanceReinsertPot = BigInt(await ethers.provider.getBalance(beneficorReinsertPot.address));
                // const finalBalanceDAO = BigInt(await ethers.provider.getBalance(beneficorDAO.address));
                // expect(finalBalanceReinsertPot - initialBalanceReinsertPot).to.equal(150n * ETHER); // Half of total initial balance
                // expect(finalBalanceDAO - initialBalanceDAO).to.equal(150n * ETHER); // Half of total initial balance
    
                // // Try to dilute after all dilutions - should fail
                // await expect(claimContract.dilute1()).to.be.revertedWith("dilute1 event did already happen!");
                // await expect(claimContract.dilute2()).to.be.revertedWith("dilute2 event did already happen!");
                // await expect(claimContract.dilute3()).to.be.revertedWith("dilute3 event did already happen!");
            });
        });
    
    });
});