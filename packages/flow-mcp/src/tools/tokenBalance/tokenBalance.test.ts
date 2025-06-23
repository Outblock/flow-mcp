import { describe, test, expect } from "bun:test";
import { getTokenBalances } from "./index";

describe("getTokenBalance", () => {
  // Use a known Flow account for testing
  const testAddress = "0x1654653399040a61"; // Flow Token account on mainnet

  test("should return token balances for a valid address on mainnet", async () => {
    const result = await getTokenBalances({
      address: testAddress,
      network: "mainnet",
    });

    expect(result).toBeDefined();
    expect(result.balances).toBeDefined();
    expect(result.address).toBe(testAddress);
    expect(result.balances["A.1654653399040a61.FlowToken.Vault"]).toBeDefined();
    expect(typeof result.balances["A.1654653399040a61.FlowToken.Vault"]).toBe("string");
  });

  test("should return token balances for a valid address on testnet", async () => {
    const result = await getTokenBalances({
      address: "0x7e60df042a9c0868", // Flow Token account on testnet
      network: "testnet",
    });

    expect(result).toBeDefined();
    expect(result.balances).toBeDefined();
    expect(result.address).toBe("0x7e60df042a9c0868");
    expect(result.balances["A.7e60df042a9c0868.FlowToken.Vault"]).toBeDefined();
    expect(typeof result.balances["A.7e60df042a9c0868.FlowToken.Vault"]).toBe("string");
  });

  test("should throw error for invalid network", async () => {
    await expect(
      getTokenBalances({
        address: testAddress,
        network: "invalid" as any,
      }),
    ).rejects.toThrow("Unsupported network");
  });

  test("should throw error for invalid address", async () => {
    await expect(
      getTokenBalances({
        address: "invalid-address",
        network: "mainnet",
      }),
    ).rejects.toThrow();
  });
});
