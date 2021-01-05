import { Client, Provider, ProviderRegistry } from "@blockstack/clarity";

const chai = require('chai')
chai.use(require('chai-string'))
const assert = chai.assert
import {STXTXClient} from "../../src/tx-clients/stx-tx-client";
import { providerWithInitialAllocations } from "./providerWithInitialAllocations";
import * as balances from '../../balances.json';


console.log(balances);
describe("stx contract test suite", () => {
  let tokenSTX: STXTXClient;
  let src20TraitClient: Client

  let provider: Provider;

  const addresses = [
    "ST2FWP4ZSFJ0GPD5ADR32M1AXC7ASE1GXB2R0NDTJ",  // investor
    "ST1F6TC9D7TQ0EV6VJ1WNJ53R26Q2ASRGWYVSSX23",  // provider
    "ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7",  // dualX contracts
  ]
  const investor = addresses[0];
  const dProvider = addresses[1];
  const contractAddress = addresses[2];

  before(async () => {
    ProviderRegistry.registerProvider(
      providerWithInitialAllocations(balances)
    )
    provider = await ProviderRegistry.createProvider();
    src20TraitClient = new Client("ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-token", "src20-token", provider);
    tokenSTX = new STXTXClient("ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7", provider);
  });
  describe("Check contracts", () => {
    it("Check and deploy contracts", async () => {
      //src20 trait
      await src20TraitClient.checkContract()
      await src20TraitClient.deployContract()
      
      //stx wrapper contract
      await tokenSTX.checkContract()
      await tokenSTX.deployContract()

    });
  })

  describe("Test Scenarios", () => {
    it("name should be", async () => {
      assert.equal((await tokenSTX.getName()).toString(), '(ok "stx-wrapr")');
    })

    it("initial balance",async()=>{
      assert.equal(await tokenSTX.balanceOf(contractAddress), 0)
      assert.equal(await tokenSTX.balanceOf(investor), 0)
    })

    it("wrap stx tokens",async()=>{
      await tokenSTX.wrapStx(20,{sender:investor})
      assert.equal(await tokenSTX.balanceOf(investor),20)
    })

    it("transfer stx tokens",async()=>{
      await tokenSTX.transfer(dProvider,10,{sender:investor})
      assert.equal(await tokenSTX.balanceOf(investor),10)
      assert.equal(await tokenSTX.balanceOf(dProvider),10)
    })
  });
  after(async () => {
    await provider.close();
  });
});
