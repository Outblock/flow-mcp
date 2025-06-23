import { describe, test, expect } from "bun:test";
import { getFlowBalance } from "./index";

describe("getFlowBalance", () => {
  // Use a known Flow account for testing
  const testAddress = "0x1654653399040a61"; // Flow Token account on mainnet

  test("should return balance for a valid address on mainnet", async () => {
    const result = await getFlowBalance({
      address: testAddress,
      network: "mainnet",
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(Number(result)).toBeGreaterThan(0);
  });

  test("should return balance for a valid address on testnet", async () => {
    const result = await getFlowBalance({
      address: "0x7e60df042a9c0868", // Flow Token account on testnet
      network: "testnet",
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(Number(result)).toBeGreaterThanOrEqual(0);
  });

  test("should throw error for invalid network", async () => {
    await expect(
      getFlowBalance({
        address: testAddress,
        network: "invalid" as any,
      }),
    ).rejects.toThrow("Unsupported network");
  });

  test("should throw error for invalid address", async () => {
    await expect(
      getFlowBalance({
        address: "invalid-address",
        network: "mainnet",
      }),
    ).rejects.toThrow();
  });
});
