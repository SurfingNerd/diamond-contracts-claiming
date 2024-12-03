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
        const parsed = Number.parseFloat(value.toString());
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

    console.log("Balances: ", balances);


    console.log("Total amount: ", totalAmount);
    console.log("Total added: ", totalAdded);
    console.log("Total dusted: ", totalDusted);
    console.log("Total dusted count:", totalDustedCount);
    console.log("Total migration accounts: ", balances.length);
    console.log("difference: ", totalAmount - totalAdded - totalDusted);
    console.log(" ===================");
    
    let snapshot: BalanceSnapshot = { 
        block: obj.snapshot.height,
        hash: obj.snapshot.hash,
        balances: balances
    };

    const snapshotAlpha5 = JSON.stringify(snapshot, null, 2);

    const outputPath = "snapshots/snapshot-beta.json";
    fs.writeFileSync(outputPath, snapshotAlpha5);

    console.log("Snapshot written to: ", outputPath);
}


doImport();