import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that NFT can be minted by contract owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall("waveloom", "mint-audio", [
        types.utf8("My Audio"),
        types.uint(180),
        types.ascii("QmXyz..."),
        types.uint(10)
      ], deployer.address)
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    assertEquals(block.receipts[0].result.expectOk(), "u1");
  },
});

Clarinet.test({
  name: "Ensure that NFT transfer works correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;

    // First mint an NFT
    let block = chain.mineBlock([
      Tx.contractCall("waveloom", "mint-audio", [
        types.utf8("Test Audio"),
        types.uint(120),
        types.ascii("QmAbc..."),
        types.uint(5)
      ], deployer.address)
    ]);

    // Then transfer it
    block = chain.mineBlock([
      Tx.contractCall("waveloom", "transfer", [
        types.uint(1),
        types.principal(deployer.address),
        types.principal(wallet1.address)
      ], deployer.address)
    ]);

    assertEquals(block.receipts[0].result.expectOk(), true);
  },
});
