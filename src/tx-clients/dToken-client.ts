import { Client, Provider, Result } from '@blockstack/clarity'
import {NotOKErr} from "../errors";
import {parse} from "../utils";

export class dTokenClient extends Client{
  
  constructor(principal: string, provider: Provider) {
    super(
      `${principal}.dToken`,
      'dToken',
      provider
    )
  }

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

  async getProfile(owner:string) {
    const query = this.createQuery({
      method: {
        name: 'get-profile',
        args: [`'${owner}`],
      },
    })
    const receipt = await this.submitQuery(query)
    return Result.unwrap(receipt)
  }
}
