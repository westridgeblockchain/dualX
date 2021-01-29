import { Client, Provider, Result } from '@blockstack/clarity'
import { TupleCV } from '@stacks/transactions';
import {NotOKErr} from "../errors";
import {parse,unwrapXYList} from "../utils";

export class DualXTXClient extends Client {
  constructor(principal: string, provider: Provider) {
    super(
      `${principal}.deposit-exchange`,
      'deposit-exchange',
      provider
    )
  }

  async invest(dProvider: string, tokenx: string, tokeny: string, amountx: number, yieldAmount: number, yieldPeriod: number, isHedger: boolean, params: { sender: any }) {
    const tx = this.createTransaction({
      method: { name: "invest", 
      args: [`'${dProvider}`,`'${tokenx}`,`'${tokeny}`,`u${amountx}`,`u${yieldAmount}`,`u${yieldPeriod}`, `${isHedger}`] }
    })
    await tx.sign(params.sender)
    const receipt = await this.submitTransaction(tx)
    if (receipt.success) {
      //console.log(receipt.debugOutput)
      const result = Result.unwrap(receipt)
      if (result.startsWith('Transaction executed and committed. Returned: ')) {
        const start_of_list = result.substring('Transaction executed and committed. Returned: '.length)  // keep a word so unwrapXYList will behave like it was with 'ok'
        const parsed = parse(start_of_list.substring(0, start_of_list.indexOf(')') + 1))
       // console.log("parsed -",parsed)
        return parsed
      }
    }
    console.log("wrap failure", receipt)
    throw NotOKErr;
  }

  async beginCycle(investor: string, dProvider: string, tokenx: string, tokeny: string, isHedger: boolean, strike: number, dToken: string, params: { sender: any }) {
    const tx = this.createTransaction({
      method: { name: "begin-cycle", 
      args: [`'${investor}`,`'${dProvider}`, `'${tokenx}`,`'${tokeny}`, `${isHedger}`,`u${strike}`,`'${dToken}`] }
    })
    await tx.sign(params.sender)
    const receipt = await this.submitTransaction(tx)
    //console.log(receipt)
    if (receipt.success) {
      
      const result = Result.unwrap(receipt)
      if (result.startsWith('Transaction executed and committed. Returned: ')) {
        const start_of_list = result.substring('Transaction executed and committed. Returned: '.length)  // keep a word so unwrapXYList will behave like it was with 'ok'
       // console.log(start_of_list);
        const parsed = parse(start_of_list.substring(0, start_of_list.indexOf('\n') + 1))
       // console.log("parsed -",parsed)
        return parsed
      }
    }
    console.log("wrap failure", receipt)
    throw NotOKErr;
  }

  async exerciseOption(investor: string, tokenx: string, tokeny: string, tokend:string, P: number, params: { sender: any }) {
    const tx = this.createTransaction({
      method: { name: "exercise-option", 
      args: [`'${investor}`,`'${tokenx}`, `'${tokeny}`,`'${tokend}`, `u${P}`] }
    })
    await tx.sign(params.sender)
    const receipt = await this.submitTransaction(tx)
    if (receipt.success) {
      //console.log(receipt.debugOutput)
      const result = Result.unwrap(receipt)
      if (result.startsWith('Transaction executed and committed. Returned: ')) {
        const start_of_list = result.substring('Transaction executed and committed. Returned: '.length)  // keep a word so unwrapXYList will behave like it was with 'ok'
        const parsed = parse(start_of_list.substring(0, start_of_list.indexOf(')') + 1))
        //console.log("parsed -",parsed)
        return parsed
      }
    }
    console.log("wrap failure", receipt)
    throw NotOKErr;
  }
  async getReturn(investor: string, tokenx: string, tokend:string, params: { sender: any }) {
    const tx = this.createTransaction({
      method: { name: "get-return", 
      args: [`'${investor}`,`'${tokenx}`,`'${tokend}`] }
    })
    await tx.sign(params.sender)
    const receipt = await this.submitTransaction(tx)
    if (receipt.success) {
      //console.log(receipt.debugOutput)
      const result = Result.unwrap(receipt)
      if (result.startsWith('Transaction executed and committed. Returned: ')) {
        const start_of_list = result.substring('Transaction executed and committed. Returned: '.length)  // keep a word so unwrapXYList will behave like it was with 'ok'
        const parsed = parse(start_of_list.substring(0, start_of_list.indexOf(')') + 1))
        //console.log("parsed -",parsed)
        return parsed
      }
    }
    console.log("wrap failure", receipt)
    throw NotOKErr;
  }
}