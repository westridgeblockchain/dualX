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


export class TokenTXClient {
  keys: any
  network: any
  contract_name: string
  token_name: string

  constructor(token_name: string, contract_name: string, keys: any, network: any) {
    this.keys = keys
    this.network = network
    this.contract_name = contract_name
    this.token_name = token_name
  }

  async deployContract() {
    const fee = new BigNum(5458)
    const contract_token = readFileSync('./contracts/token-x.clar').toString()

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

  async transfer(keys_recipient: any, amount: number, params: { keys_sender: any }): Promise<ClarityValue> {
    console.log("transfer", params.keys_sender.stacksAddress, keys_recipient.stacksAddress)
    const fee = new BigNum(256)
    const transaction = await makeContractCall({
      contractAddress: this.keys.stacksAddress,
      contractName: this.contract_name,
      functionName: "transfer",
      functionArgs: [standardPrincipalCV(keys_recipient.stacksAddress), uintCV(amount)],
      senderKey: params.keys_sender.secretKey,
      network: this.network,
      postConditionMode: PostConditionMode.Allow,
      postConditions: [
        // makeStandardSTXPostCondition(
        //   keys_sender.stacksAddress,
        //   FungibleConditionCode.Equal,
        //   new BigNum(amount)
        // ),
        // makeStandardFungiblePostCondition(
        // ),
      ],
      fee,
      // nonce: new BigNum(0),
    })
    const tx_id = await broadcastTransaction(transaction, this.network)
    const tx = await waitForTX(this.network.coreApiUrl, tx_id, 10000)

    const result = deserializeCV(Buffer.from(tx.tx_result.hex.substr(2), "hex"))
    return result
  }

  //read only
  async getName(keys_owner: any, params: { keys_sender: any }){
    console.log("get name with sender", keys_owner.stacksAddress, params.keys_sender.stacksAddress)
    const function_name = "get-name";
    const owner = serializeCV(standardPrincipalCV(keys_owner.stacksAddress))
    const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: `{"sender":"${params.keys_sender.stacksAddress}","arguments":[]}`,
      }
      const response = await fetch(`${this.network.coreApiUrl}/v2/contracts/call-read/${this.keys.stacksAddress}/${this.contract_name}/${function_name}`, options)
  
      if (response.ok) {
        const result = await response.json()
        console.log("Result = ",result);
        if (result.okay) {  
          const result_value = cvToString(result, "hex");
          console.log("result_value ",result_value);
          //const result_data = result_value as UIntCV
          // console.log(function_name, result_data.value.toString())
          // @ts-ignore
          return result_value
        } else {
          console.log(result)
        }
      } else {
        console.log("not 200 response", response)
      }
    }

  // read only
  async balanceOf(keys_owner: any, params: { keys_sender: any }) {
    console.log("balanceOf with sender", keys_owner.stacksAddress, params.keys_sender.stacksAddress)
    const function_name = "get-balance-of"

    const owner = serializeCV(standardPrincipalCV(keys_owner.stacksAddress))

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: `{"sender":"${params.keys_sender.stacksAddress}","arguments":["0x${owner.toString("hex")}"]}`,
    }
    const response = await fetch(`${this.network.coreApiUrl}/v2/contracts/call-read/${this.keys.stacksAddress}/${this.contract_name}/${function_name}`, options)

    if (response.ok) {
      const result = await response.json()
      if (result.okay) {
        const result_value = deserializeCV(Buffer.from(result.result.substr(2), "hex"))
        const result_data = result_value as UIntCV
        // console.log(function_name, result_data.value.value.toString())
        // @ts-ignore
        return result_data.value.value
      } else {
        console.log(result)
      }
    } else {
      console.log("not 200 response", response)
    }
  }

}