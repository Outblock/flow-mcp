import { describe, test, expect } from 'bun:test';
import { getContractTool } from '../src/tools/getContract/index';
import { getContractSchema } from '../src/tools/getContract/schema';
import type { GetContractSchema } from '../src/tools/getContract/schema';

describe('getContract', () => {
  describe('schema validation', () => {
    test('should accept valid input', () => {
      const validInput = {
        address: '0xf233dcee88fe0abe',
        contractName: 'FungibleToken',
        network: 'mainnet' as const
      } satisfies GetContractSchema;
      
      const parsed = getContractSchema.safeParse(validInput);
      expect(parsed.success).toBe(true);
    });

    test('should reject empty strings', () => {
      const emptyStrings = {
        address: '',
        contractName: '',
      };
      const result = getContractSchema.safeParse(emptyStrings);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe('Address is required');
        expect(errors[1].message).toBe('Contract name is required');
      }
    });

    test('should use mainnet as default network', () => {
      const input = {
        address: '0xf233dcee88fe0abe',
        contractName: 'FungibleToken',
      };
      const result = getContractSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.network).toBe('mainnet');
      }
    });
  });

  test('should have correct tool registration', () => {
    expect(getContractTool.name).toBe('mcp_flow_mcp_get_contract');
    expect(getContractTool.description).toBeDefined();
    expect(getContractTool.inputSchema).toBeDefined();
    expect(getContractTool.handler).toBeDefined();
    
    const schema = getContractTool.inputSchema;
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
    expect(schema.required).toContain('address');
    expect(schema.required).toContain('contractName');
  });
}); 