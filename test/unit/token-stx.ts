import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";
describe("stx contract test suite", () => {
  let tokenSTX: Client;
  let provider: Provider;
  before(async () => {
    provider = await ProviderRegistry.createProvider();
    tokenSTX = new Client("ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.token-stx", "token-stx", provider);
  });
  it("should have a valid syntax", async () => {
    await tokenSTX.checkContract();
  });
  describe("deploying an instance of the contract", () => {
    const getName = async () => {
      const query = tokenSTX.createQuery({
        method: { name: "get-name", args: [] }
      });
      const receipt = await tokenSTX.submitQuery(query);
      const result = Result.unwrapString(receipt);
      return result;
    }
    // before(async () => {
    //   await tokenSTX.deployContract();
    // });
    // it("name should be", async () => {
    //   const name = await getName();
    //   assert.equal(name, 'token-x');
    // })
  });
  after(async () => {
    await provider.close();
  });
});
