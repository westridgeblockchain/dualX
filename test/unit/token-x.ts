import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";
describe("token-x contract test suite", () => {
  let tokenX: Client;
  let provider: Provider;
  before(async () => {
    provider = await ProviderRegistry.createProvider();
    tokenX = new Client("ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.token-x", "token-x", provider);
  });
  it("should have a valid syntax", async () => {
    await tokenX.checkContract();
  });
  describe("deploying an instance of the contract", () => {
    const getName = async () => {
      const query = tokenX.createQuery({
        method: { name: "get-name", args: [] }
      });
      const receipt = await tokenX.submitQuery(query);
      const result = Result.unwrapString(receipt);
      return result;
    }
    // const execMethod = async (method: string) => {
    //   const tx = tokenX.createTransaction({
    //     method: {
    //       name: method,
    //       args: [],
    //     },
    //   });
    //   await tx.sign("ST13W5E9JKRMFRM2KMP6ZTGR1KQPJK34K8HVX4YVR");
    //   const receipt = await tokenX.submitTransaction(tx);
    //   return receipt;
    // }
    before(async () => {
      await tokenX.deployContract();
    });
    it("name should be", async () => {
      const name = await getName();
      assert.equal(name, 'stx-wrapr');
    })
  });
  after(async () => {
    await provider.close();
  });
});
