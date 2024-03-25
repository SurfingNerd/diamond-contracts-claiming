import { CryptoSol } from "../src/cryptoSol";
import { TestFunctions } from "../../test/testFunctions";

export async function fillTestData() {

  //  function fill(bytes20[] memory _accounts, uint256[] memory _balances) public payable {

  // const accounts = [];
  // const balances = [];

  const cryptoSol = await CryptoSol.fromContractAddress("0xE1B81826cf8DA91097B6Ab1d160eD6e139C29b52");

  const testFunctions = new TestFunctions(cryptoSol.instance);
  testFunctions.setLogDebug(true);
  console.log("adding test balances.");
  await testFunctions.testAddBalances();
}
