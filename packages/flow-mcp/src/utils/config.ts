export const networks = ["mainnet", "testnet"] as const;

export type Network = (typeof networks)[number];

export const networkName: Network = (process.env.NETWORK as Network) || "testnet";
