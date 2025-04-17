import { describe, test, expect } from 'bun:test';
import { getTokenBalance } from './index';

describe('getTokenBalance', () => {
  // Use a known Flow account for testing
  const testAddress = '0x1654653399040a61'; // Flow Token account on mainnet
  
  test('should return token balances for a valid address on mainnet', async () => {
    const result = await getTokenBalance({
      address: testAddress,
      network: 'mainnet',
      tokenIdentifier: 'A.1654653399040a61.FlowToken.Vault'
    });

    expect(result).toBeDefined();
    expect(result.balance).toBeDefined();
    expect(result.address).toBe(testAddress);
    expect(result.balance.availableFlowToken).toBeDefined();
    expect(typeof result.balance.availableFlowToken).toBe('string');
  });

  test('should return token balances for a valid address on testnet', async () => {
    const result = await getTokenBalance({
      address: '0x7e60df042a9c0868', // Flow Token account on testnet
      network: 'testnet',
      tokenIdentifier: 'A.7e60df042a9c0868.FlowToken.Vault'
    });

    expect(result).toBeDefined();
    expect(result.balance).toBeDefined();
    expect(result.address).toBe('0x7e60df042a9c0868');
    expect(result.balance.availableFlowToken).toBeDefined();
    expect(typeof result.balance.availableFlowToken).toBe('string');
  });

  test('should throw error for invalid network', async () => {
    await expect(getTokenBalance({
      address: testAddress,
      network: 'invalid' as any,
      tokenIdentifier: 'A.1654653399040a61.FlowToken.Vault'
    })).rejects.toThrow('Unsupported network');
  });

  test('should throw error for invalid address', async () => {
    await expect(getTokenBalance({
      address: 'invalid-address',
      network: 'mainnet',
      tokenIdentifier: 'A.1654653399040a61.FlowToken.Vault'
    })).rejects.toThrow();
  });
}); 