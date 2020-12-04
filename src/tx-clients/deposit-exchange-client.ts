const BigNum = require('bn.js')
import { readFileSync } from 'fs'
import {
  makeSmartContractDeploy,
  makeContractCall,
  ClarityValue,

  serializeCV,
  deserializeCV,
  standardPrincipalCV,
  uintCV,
  UIntCV,
  broadcastTransaction,

  PostConditionMode,
} from '@blockstack/stacks-transactions'

import {
    cvToString,
  waitForTX,
} from '../tx-utils'


export class DepositExTXClient {
  keys: any
  network: any
  contract_name: string

  constructor( keys: any, network: any) {
    this.keys = keys;
    this.network = network;
    this.contract_name = "dualX";
  }

  async deployContract() {
    const fee = new BigNum(8063)
    const contract_token = readFileSync('./contracts/deposit-exchange.clar').toString()

    console.log(`deploying ${this.contract_name} contract`)
    const transaction_deploy_trait = await makeSmartContractDeploy({
      contractName: this.contract_name,
      codeBody: contract_token,
      senderKey: this.keys.secretKey,
      network: this.network,
      fee,
      // nonce: new BigNum(0),
    })
    const tx_id = await broadcastTransaction(transaction_deploy_trait, this.network)
    const tx = await waitForTX(this.network.coreApiUrl, tx_id, 10000)

    const result = deserializeCV(Buffer.from(tx.tx_result.hex.substr(2), "hex"))
    return result
  }

  async addOption(keys_owner: any, params: { keys_sender: any }){

  }
  

}