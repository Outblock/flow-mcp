import { describe, test, expect } from "bun:test";
import { childAccountTool } from "./index.js";
import { childAccountSchema } from "./schema.js";
import type { ChildAccountSchema } from "./schema.js";

describe("childAccount", () => {
  describe("schema validation", () => {
    test("should accept valid input", () => {
      const validInput = {
        address: "0x84221fe0294044d7",
        network: "mainnet" as const,
      } satisfies ChildAccountSchema;

      const parsed = childAccountSchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    test("should reject empty strings", () => {
      const emptyStrings = {
        address: "",
      };
      const result = childAccountSchema.safeParse(emptyStrings);
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
        address: "0x84221fe0294044d7",
      };
      const result = childAccountSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.network).toBe("mainnet");
      }
    });
  });

  test("should have correct tool registration", () => {
    expect(childAccountTool.name).toBe("get_child_account");
    expect(childAccountTool.description).toBeDefined();
    expect(childAccountTool.inputSchema).toBeDefined();
    expect(childAccountTool.handler).toBeDefined();

    // Verify schema matches the childAccountSchema
    expect(childAccountTool.inputSchema).toBe(childAccountSchema);
  });
});
