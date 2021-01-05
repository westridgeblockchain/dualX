import { Client, Provider, Result } from '@blockstack/clarity'
import {NotOKErr} from "../errors";
import {parse,unwrapXYList} from "../utils";

export class STXTXClient extends Client {
  
  constructor(principal: string, provider: Provider) {
    super(
      `${principal}.token-stx`,
      'token-stx',
      provider
    )
  }
  
  async transfer(recipient: string, amount: number, params: { sender: any }) {
    const tx = this.createTransaction({
      method: { name: "transfer", 
      args: [`'${recipient}`,`u${amount}`] }
    })
    await tx.sign(params.sender)
    const receipt = await this.submitTransaction(tx)
    if (receipt.success) {
      //console.log(receipt.debugOutput)
      const result = Result.unwrap(receipt)
      if (result.startsWith('Transaction executed and committed. Returned: ')) {
        const start_of_list = result.substring('Transaction executed and committed. Returned: '.length)  // keep a word so unwrapXYList will behave like it was with 'ok'
        const parsed = parse(start_of_list.substring(0, start_of_list.indexOf(')') + 1))
        console.log("parsed -",parsed)
        return parsed
      }
    }
    console.log("wrap failure", receipt)
    throw NotOKErr;
  }

  //read only
  async getName(){
    const query = this.createQuery({
      method: {
        name: 'get-name',
        args: [],
      },
    })
    const receipt = await this.submitQuery(query)
    return Result.unwrap(receipt)
    }

  // read only
  async balanceOf(owner:string) {
    const query = this.createQuery({
      method: {
        name: 'get-balance-of',
        args: [`'${owner}`],
      },
    })
    const receipt = await this.submitQuery(query)
    return Result.unwrapUInt(receipt)
  }

  //wrap stx
  async wrapStx(amount:number,params: { sender: string }) {
    const tx = this.createTransaction({
      method: { name: "wrap", 
      args: [`u${amount}`] }
    })
    await tx.sign(params.sender)
    const receipt = await this.submitTransaction(tx)
    if (receipt.success) {
      //console.log(receipt.debugOutput)
      const result = Result.unwrap(receipt)
      if (result.startsWith('Transaction executed and committed. Returned: ')) {
        const start_of_list = result.substring('Transaction executed and committed. Returned: '.length)  // keep a word so unwrapXYList will behave like it was with 'ok'
        const parsed = parse(start_of_list.substring(0, start_of_list.indexOf(')') + 1))
      //  console.log("parsed -",parsed)
        return unwrapXYList(parsed)
      }
    }
    console.log("wrap failure", receipt)
    throw NotOKErr;
  }

}