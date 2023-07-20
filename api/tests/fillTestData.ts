

import Web3 from "web3";
import { CryptoSol } from "../src/cryptoSol";
import   { TestFunctions } from "./testFunctions";

export async function fillTestData(web3: Web3) {

  //  function fill(bytes20[] memory _accounts, uint256[] memory _balances) public payable {

  // const accounts = [];
  // const balances = [];

  //const web3 = new Web3('http://localhost:8545');
  

  const cryptoSol = CryptoSol.fromContractAddress(web3, "0xE1B81826cf8DA91097B6Ab1d160eD6e139C29b52");

  const testFunctions = new TestFunctions(web3, cryptoSol.instance);
  testFunctions.setLogDebug(true);
  console.log("adding test balances.");
  await testFunctions.testAddBalances();

}
