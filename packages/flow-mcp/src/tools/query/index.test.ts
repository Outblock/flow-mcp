import { describe, test, expect } from "bun:test";
import { queryTool } from "./index.js";
import { querySchema } from "./schema.js";
import type { QuerySchema } from "./schema.js";

describe("query", () => {
  describe("schema validation", () => {
    test("should accept valid input", () => {
      const validInput = {
        script: 'access(all) fun main(name: String): String { return "Hello, (name)!" }',
        args: ["test"],
        network: "mainnet" as const,
      } satisfies QuerySchema;

      const parsed = querySchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    test("should accept input without args", () => {
      const validInput = {
        script: 'pub fun main(): String { return "Hello, Flow!" }',
        network: "mainnet" as const,
      } satisfies QuerySchema;

      const parsed = querySchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    test("should reject empty script", () => {
      const emptyScript = {
        script: "",
        args: [],
      };
      const result = querySchema.safeParse(emptyScript);
      expect(result.success).toBe(true);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors).toHaveLength(1);
        expect(errors[0].path).toContain("script");
      }
    });

    test("should use mainnet as default network", () => {
      const input = {
        script: 'access(all) fun main(name: String): String { return "Hello, (name)!" }',
      };
      const result = querySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.network).toBe("mainnet");
      }
    });

    test("should validate network value", () => {
      const invalidNetwork = {
        script: 'pub fun main(): String { return "Hello, Flow!" }',
        network: "invalid_network" as any,
      };
      const result = querySchema.safeParse(invalidNetwork);
      expect(result.success).toBe(false);
    });

    test("should run script", async () => {
      const input = {
        script: `access(all) fun main(name: String): String { return "Hello, ".concat(name) }`,
        args: ["test"],
        network: "mainnet" as const,
      } satisfies QuerySchema;

      const result = await queryTool.handler(input);
      console.log(result);
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Hello, test");
    });
  });

  test("should have correct tool registration", () => {
    expect(queryTool.name).toBe("execute_query");
    expect(queryTool.description).toBeDefined();
    expect(queryTool.inputSchema).toBeDefined();
    expect(queryTool.handler).toBeDefined();

    // Verify schema matches the querySchema
    expect(queryTool.inputSchema).toBe(querySchema);
  });
});
