import { BalanceSnapshot, BalanceV3 } from "../api/data/interfaces";
import { ethers } from 'ethers';
import fs from 'fs';



async function doImport() {


    let importUrl = "https://chainz.cryptoid.info/dmd/api.dws?q=allbalances&key="
    let apiKey =  fs.readFileSync("secret-chainz-api-key.txt", "utf-8").trim();
    const response = await fetch(importUrl + apiKey);

    console.log("Status:", response.status);

    //console.log("response: ", );

    const bodyText = await response.text();

    //console.log(bodyText.substring(0, 1000));
    //console.log("...");
    //const json = await response.json();

    const obj = JSON.parse(bodyText);


    console.log("snapshot block", obj.snapshot.height);
    console.log("snapshot hash: ", obj.snapshot.hash);

    //54_700_000_000_000

    let totalAmount = 0;
    let totalAdded = 0;
    let totalDusted = 0;

    let totalDustedCount = 0;

    let balances: BalanceV3[] = [];

    for (const entry of Object.entries(obj.balances)) {
        const oldV3 = entry[0];
        const value = entry[1] as any;

        // maybe better accuracy to use BN here.
        // value to add to make sure everyone get at leas there amount (rounding errors of chainz interface): 10000000000
        //let eth = web3.utils.toWei("1", "ether");
        console.log("unparsed: ", oldV3, " : ", value);
        // chainz does have innaccuracies, so we add a small amount to make sure everyone gets at least what they had for the DMDv4 Airdrop.
        const parsed = Number.parseFloat((Number.parseFloat(value.toString()) + 0.00000001).toFixed(8));

        totalAmount += parsed;
        //console.log(oldV3, " :", parsed);

        if (parsed >= 1) {
            totalAdded += parsed;
            balances.push({
                dmdv3Address: oldV3,
                value: ethers.parseEther(parsed.toString()).toString(10)
            });
        } else {
            totalDusted += parsed;
            totalDustedCount++;
        }
    }

    balances.sort((a, b) => {
        const aN = ethers.parseUnits(a.value, 10);
        const bN = ethers.parseUnits(b.value, 10);

        return (aN == bN) ? 0 : (aN < bN) ? 1 : -1;
    });


    

    console.log("Balances: ", balances.length);
    console.log("Total amount: ", totalAmount);
    console.log("Total added: ", totalAdded);
    console.log("Total dusted: ", totalDusted);
    console.log("Total dusted count:", totalDustedCount);
    console.log("Total migration accounts: ", balances.length);
    console.log("difference: ", totalAmount - totalAdded - totalDusted);
    console.log(" ===================");


    const report = " ===================" + "\n"
+ "Balances: " + balances.length.toString() + "\n"
+ "Total amount: " + totalAmount.toString() + "\n"
+ "Total added: " + totalAdded.toString() + "\n"
+ "Total dusted: " + totalDusted.toString() + "\n"
+ "Total dusted count:" + totalDustedCount.toString() + "\n"
+ "Total migration accounts: " + balances.length + "\n"
+ "difference: " + (totalAmount - totalAdded - totalDusted).toString()  + "\n"
+ " ===================";

    let csv = "\"address\";\"value\"\n";


    for (const bal of balances) {
        csv += "\"" + bal.dmdv3Address + "\";" + ethers.formatUnits(bal.value, "ether") + "\n";
    }
    
    let snapshot: BalanceSnapshot = { 
        block: obj.snapshot.height,
        hash: obj.snapshot.hash,
        balances: balances
    };

    const snapshotJson = JSON.stringify(snapshot, null, 2);


    const outputPath = "snapshots/snapshot-mainnet_" + obj.snapshot.height + ".json";


    fs.writeFileSync(outputPath, snapshotJson);

    fs.writeFileSync("snapshots/snapshot-mainnet_" + obj.snapshot.height + "_report.txt", report);

    fs.writeFileSync("snapshots/snapshot-mainnet_" + obj.snapshot.height + ".csv", csv);

    console.log("Snapshot written to: ", outputPath);
}


doImport();