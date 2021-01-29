import { Client, Provider, Result } from '@blockstack/clarity'
import { TupleCV } from '@stacks/transactions';
import {NotOKErr} from "../errors";
import {parse,unwrapXYList} from "../utils";

export class GamXTXClient extends Client {
  constructor(principal: string, provider: Provider) {
      console.log("Initializing GamX = ",principal + 'GamX');
    super(
      `${principal}.GamX`,
      'GamX',
      provider
    )
  }
}