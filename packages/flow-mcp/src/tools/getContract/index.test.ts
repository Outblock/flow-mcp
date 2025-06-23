import { describe, test, expect } from "bun:test";
import { getContractTool } from "./index.js";
import { getContractSchema } from "./schema.js";
import type { GetContractSchema } from "./schema.js";

describe("getContract", () => {
  describe("schema validation", () => {
    test("should accept valid input", () => {
      const validInput = {
        address: "0xf233dcee88fe0abe",
        contractName: "FungibleToken",
        network: "mainnet" as const,
      } satisfies GetContractSchema;

      const parsed = getContractSchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    test("should reject empty strings", () => {
      const emptyStrings = {
        address: "",
        contractName: "",
      };
      const result = getContractSchema.safeParse(emptyStrings);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe(
          "Invalid Flow address format. Must be 16 hexadecimal characters, optionally prefixed with '0x'"
        );
        expect(errors[1].message).toBe("Contract name is required");
      }
    });

    test("should use mainnet as default network", () => {
      const input = {
        address: "0xf233dcee88fe0abe",
        contractName: "FungibleToken",
      };
      const result = getContractSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.network).toBe("mainnet");
      }
    });

    test("should reject missing fields", () => {
      const schema = getContractTool.inputSchema;
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  test("should have correct tool registration", () => {
    expect(getContractTool.name).toBe("get_contract");
    expect(getContractTool.inputSchema).toBe(getContractSchema);
  });
});
