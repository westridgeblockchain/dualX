import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";
describe("deposit exchange unit test suite", () => {
  let dcdClient: Client;
  let tokenTraitClient: Client;
  let provider: Provider;
  before(async () => {
    provider = await ProviderRegistry.createProvider();
    tokenTraitClient = new Client("ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-trait", "src20-trait", provider);
    dcdClient = new Client("ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.deposit-exchange", "deposit-exchange", provider);
  });
  it("should have a valid syntax", async () => {
    await tokenTraitClient.checkContract();
    await tokenTraitClient.deployContract();
    await dcdClient.checkContract();
  });
  describe("deploying an instance of the contract", () => {
    
    const execMethod = async (method: string) => {
      const tx = dcdClient.createTransaction({
        method: {
          name: method,
          args: [],
        },
      });
      await tx.sign("ST13W5E9JKRMFRM2KMP6ZTGR1KQPJK34K8HVX4YVR");
      const receipt = await dcdClient.submitTransaction(tx);
      return receipt;
    }
    before(async () => {
      
      await dcdClient.deployContract();
    });
    // it("should start at zero", async () => {
    //   const counter = await getCounter();
    //   assert.equal(counter, 0);
    // })
    // it("should increment", async () => {
    //   await execMethod("increment");
    //   assert.equal(await getCounter(), 1);
    //   await execMethod("increment");
    //   assert.equal(await getCounter(), 2);
    // })
    // it("should decrement", async () => {
    //   await execMethod("decrement");
    //   assert.equal(await getCounter(), 1);
    //   await execMethod("decrement");
    //   assert.equal(await getCounter(), 0);
    // })
  });
  after(async () => {
    await provider.close();
  });
});
