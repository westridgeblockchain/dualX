const BigNum = require('bn.js')
import { readFileSync } from 'fs'
import {
  makeSmartContractDeploy,
  deserializeCV,
  broadcastTransaction,
} from '@blockstack/stacks-transactions'

import {
  waitForTX,
} from '../tx-utils'



export class TraitTXClient {
  keys: any
  network: any
  contract_name: string

  constructor(keys, network) {
    this.keys = keys
    this.network = network
    this.contract_name = 'src20-token'
  }

	async deployContract() {
	  const fee = new BigNum(2154)
    const contract_trait_body = readFileSync('./contracts/src20-token.clar').toString()

	  console.log("deploying trait contract",this.keys.secretKey)
	  const transaction_deploy_trait = await makeSmartContractDeploy({
	    contractName: this.contract_name,
	    codeBody: contract_trait_body,
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

}
