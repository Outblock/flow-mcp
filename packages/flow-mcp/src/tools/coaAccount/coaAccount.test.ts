import { describe, test, expect } from "bun:test";
import { getCoaAccount } from "./index";

describe("getCoaAccount", () => {
  // Use a known Flow account for testing
  const testAddress = "0x81fddef5f426f7c8"; // Flow Token account on mainnet

  test("should return COA account info for a valid address on mainnet", async () => {
    const result = await getCoaAccount({
      address: testAddress,
      network: "mainnet",
    });

    expect(result).toBeDefined();
    // The result will be an empty string if no COA account is found
    expect(typeof result).toBe("string");
  });

  test("should return COA account info for a valid address on testnet", async () => {
    const result = await getCoaAccount({
      address: "0x82259fd07f427b41", // Flow Token account on testnet
      network: "testnet",
    });

    expect(result).toBeDefined();
    // The result will be an empty string if no COA account is found
    expect(typeof result).toBe("string");
  });

  test("should throw error for invalid network", async () => {
    await expect(
      getCoaAccount({
        address: testAddress,
        network: "invalid" as any,
      }),
    ).rejects.toThrow("Unsupported network");
  });

  test("should throw error for invalid address", async () => {
    await expect(
      getCoaAccount({
        address: "invalid-address",
        network: "mainnet",
      }),
    ).rejects.toThrow();
  });
});
