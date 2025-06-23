import { describe, test, expect } from "bun:test";
import { accountInfoTool } from "./index.js";
import { accountInfoSchema } from "./schema.js";
import type { AccountInfoSchema } from "./schema.js";

describe("accountInfo", () => {
  describe("schema validation", () => {
    test("should accept valid input", () => {
      const validInput = {
        address: "0xf233dcee88fe0abe",
        network: "mainnet" as const,
      } satisfies AccountInfoSchema;

      const parsed = accountInfoSchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    test("should reject empty strings", () => {
      const emptyStrings = {
        address: "",
      };
      const result = accountInfoSchema.safeParse(emptyStrings);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
          "Invalid Flow address format. Must be 16 hexadecimal characters, optionally prefixed with '0x'"
        );
      }
    });

    test("should use mainnet as default network", () => {
      const input = {
        address: "0xf233dcee88fe0abe",
      };
      const result = accountInfoSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.network).toBe("mainnet");
      }
    });
  });

  test("should have correct tool registration", () => {
    expect(accountInfoTool.name).toBe("get_account_info");
    expect(accountInfoTool.description).toBeDefined();
    expect(accountInfoTool.inputSchema).toBeDefined();
    expect(accountInfoTool.handler).toBeDefined();

    // Verify schema matches the accountInfoSchema
    expect(accountInfoTool.inputSchema).toBe(accountInfoSchema);
  });
});
