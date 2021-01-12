import { Client, Provider, ProviderRegistry } from "@blockstack/clarity";

const chai = require('chai')
chai.use(require('chai-string'))
const assert = chai.assert
import {TokenTXClient} from "../../src/tx-clients/token-tx-client"

describe("token-x contract test suite", () => {
  let tokenX: TokenTXClient;
  let src20TraitClient: Client;
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
    provider = await ProviderRegistry.createProvider();
    src20TraitClient = new Client("ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-token", "src20-token", provider);
    tokenX = new TokenTXClient(contractAddress, provider);
  });
  describe("Check contracts", () => {
    it("should have valid syntax", async () => {
      //src20 trait
      await src20TraitClient.checkContract()
      await src20TraitClient.deployContract()
      
      //token-x
      await tokenX.checkContract()
      await tokenX.deployContract()
      
    });
  })

  describe("Test Scenarios", () => {
    it("name should be", async () => {
      assert.equal((await tokenX.getName()).toString(), '(ok "wrapped-btc")');
    })

    it("initial balance",async()=>{
      assert.equal(await tokenX.balanceOf(dProvider), 200000000)
      assert.equal(await tokenX.balanceOf(investor), 2000000000)
    })

    it("transfer x tokens",async()=>{
      await tokenX.transfer(dProvider,10000000,{sender:investor})//this represents 0.1
      assert.equal(await tokenX.balanceOf(investor),1990000000)
      assert.equal(await tokenX.balanceOf(dProvider),210000000)
    })
  });
 
   after(async () => {
    await provider.close();
  });
});
