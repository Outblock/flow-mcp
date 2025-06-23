import { createPublicClient, http } from "viem";
import type { PublicClient, Chain } from "viem";
import { flowMainnet, flowTestnet } from "viem/chains";

export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: flowMainnet,
    transport: http(),
  });
}
