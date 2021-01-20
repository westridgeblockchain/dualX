import { Client, Provider, ProviderRegistry } from "@blockstack/clarity";

const chai = require('chai')
chai.use(require('chai-string'))
const assert = chai.assert
import {STXTXClient} from "../../src/tx-clients/stx-tx-client";
import {TokenTXClient} from "../../src/tx-clients/token-tx-client"
import {DualXTXClient} from "../../src/tx-clients/deposit-exchange-client"
import {dTokenClient} from "../../src/tx-clients/dToken-client"
import { providerWithInitialAllocations } from "./providerWithInitialAllocations";

import * as balances from '../../balances.json';


console.log(balances);


describe("deposit exchange test suite", () => {
  let tokenD: dTokenClient;
  let tokenX: TokenTXClient;
  let tokenSTX: STXTXClient;
  let src20TraitClient: Client;
  let dTokenTraitClient: Client;
  let dualX: DualXTXClient;
  let provider: Provider;

  const addresses = [
    "ST2FWP4ZSFJ0GPD5ADR32M1AXC7ASE1GXB2R0NDTJ",  // investor
    "ST1F6TC9D7TQ0EV6VJ1WNJ53R26Q2ASRGWYVSSX23",  // provider
    "ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7",  // dualX contracts
  ]
  const investor = addresses[0];
  const dProvider = addresses[1];
  const contractAddress = addresses[2];
  const stxToken = `ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.token-stx`;
  const xToken = `ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.token-x`;
  const dToken = `ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.dToken`;
  

  before(async () => {
    ProviderRegistry.registerProvider(
      providerWithInitialAllocations(balances)
    )
    provider = await ProviderRegistry.createProvider();
    src20TraitClient = new Client(contractAddress+".src20-token", "src20-token", provider);
    dTokenTraitClient = new Client(contractAddress+".dToken-trait", "dToken-trait", provider);
    tokenSTX = new STXTXClient(contractAddress, provider);
    tokenX = new TokenTXClient(contractAddress, provider);
    dualX = new DualXTXClient(contractAddress, provider);
    tokenD = new dTokenClient(contractAddress,provider);
  });
  describe("DualX contracts", () => {
    it("should have a valid syntax", async () => {
      //src20 trait
      await src20TraitClient.checkContract()
      await src20TraitClient.deployContract()
      
      //dToken Trait
      await dTokenTraitClient.checkContract()
      await dTokenTraitClient.deployContract()

      //token-x
      await tokenX.checkContract()
      await tokenX.deployContract()

      //stx wrapper contract
      await tokenSTX.checkContract()
      await tokenSTX.deployContract()

      //dToken contraact
      await tokenD.checkContract()
      await tokenD.deployContract()

      //deposit exchange contract
      await dualX.checkContract()
      await dualX.deployContract()

    });
  });

  describe("Test Scenarios", () => {
    it("initial balance",async()=>{
      await tokenSTX.wrapStx(150000_000_000_00,{sender:dProvider})
      assert.equal(await tokenSTX.balanceOf(dProvider),150000_000_000_00)
      assert.equal(await tokenSTX.balanceOf(investor),0)
      assert.equal(await tokenX.balanceOf(dProvider), 2_000_000_00)
      assert.equal(await tokenX.balanceOf(investor), 20_000_000_00)
    })

    it("invest in dualX", async () => {
     await dualX.invest(dProvider,xToken, stxToken,2_000_000_00,1_000_000_00,1,true,{sender:investor})
     assert.equal(await tokenX.balanceOf(dProvider), 1_000_000_00)
     assert.equal(await tokenX.balanceOf(investor), 19_000_000_00)
    })

    it("begin the investment cycle", async()=>{
      await dualX.beginCycle(investor, dProvider,true, 1420,dToken,{sender:contractAddress})
      assert.equal(await tokenD.balanceOf(dProvider),140845)
      assert.equal(await tokenD.getProfile(dProvider),'(ok "STX/BTC")')
    })

    // it("exercise option by the provider", async() => {
    //   await dualX.exerciseOption(investor,xToken,stxToken, 4_000_000_0,{sender:dProvider})
    //   assert.equal(await tokenX.balanceOf(investor),20_200_000_00)
    //   assert.equal(await tokenX.balanceOf(dProvider),1_800_000_00)
    //   assert.equal(await tokenSTX.balanceOf(investor),56338_000_000_00)
    //   assert.equal(await tokenSTX.balanceOf(dProvider),93662_000_000_00)

    //   // await dualX.exerciseOption(investor,xToken,stxToken, 1_000_000_00,{sender:dProvider})
    //   // assert.equal(await tokenX.balanceOf(investor),19_000_000_00)
    //   // assert.equal(await tokenX.balanceOf(dProvider),3_000_000_00)
    //   // assert.equal(await tokenSTX.balanceOf(investor),140845_000_000_00)
    //   // assert.equal(await tokenSTX.balanceOf(dProvider),9155_000_000_00)
    // })

    it("get return by the investor", async() => {
      await dualX.getReturn(dProvider,xToken,{sender:investor})
      assert.equal(await tokenX.balanceOf(investor),21_000_000_00)
      assert.equal(await tokenX.balanceOf(dProvider),1_000_000_00)
      assert.equal(await tokenSTX.balanceOf(investor),0)
    })
  });

  after(async () => {
    await provider.close();
  });
});
