const BigNum = require('bn.js')
import * as fs from "fs";
import {
  makeSmartContractDeploy,
  makeContractCall,
  TransactionVersion,
  FungibleConditionCode,
  uintCV,
  ChainID,
  makeStandardSTXPostCondition,
  makeContractSTXPostCondition,
  StacksTestnet,
  broadcastTransaction,
} from "@blockstack/stacks-transactions";
import {
  StacksClient,
} from '../../src/tx-clients/stacks-client'
import {
  TraitTXClient,
} from '../../src/tx-clients/trait-tx-client'
import { TokenTXClient } from "../../src/tx-clients/token-tx-client";
import { DepositExTXClient } from "../../src/tx-clients/deposit-exchange-client";
const chai = require('chai')
chai.use(require('chai-string'))
const assert = chai.assert
const STACKS_API_URL = 'http://localhost:20443'
describe("dualX integration scenarios", async () => {
    const key_investor = JSON.parse(fs.readFileSync('./keys-investor.json').toString())
    const key_bob = JSON.parse(fs.readFileSync('./keys-provider.json').toString())
    const key_contract = JSON.parse(fs.readFileSync('./keys-contract.json').toString())
    const network = new StacksTestnet()
    network.coreApiUrl = STACKS_API_URL
    const stacksClient = new StacksClient(network); 
    const traitTXClient = new TraitTXClient(key_contract, network);
    const tokenXClient = new TokenTXClient("token-x","token-x",key_contract,network);
    const depExClient = new DepositExTXClient(key_contract,network);
    before(async () => {
      try {
       //await traitTXClient.deployContract();
        //await tokenXClient.deployContract();
        await depExClient.deployContract();
        console.log("Trait deployed");
      } catch(e) {
        console.log("Seme exception",e.message);
        if (e.message.indexOf('ContractAlreadyExists') === -1) {
          console.log(e.message)
        }
      }
      
    })
    it("scenario #1: Investor confirming an offer ", async () => {
      //initial balance of X(BTC) deposit currency token
      const balance_investor_tokenx = await tokenXClient.balanceOf(key_investor, { keys_sender: key_investor })
      assert.equal(balance_investor_tokenx.toString(), '2000000')
      
    })
  })
