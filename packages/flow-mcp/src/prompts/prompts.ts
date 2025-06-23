import { flowBalanceSchema, type FlowBalanceSchema } from "@/tools/flowBalance/schema";
import { accountInfoSchema, type AccountInfoSchema } from "@/tools/accountInfo/schema";
import { coaAccountSchema, type CoaAccountSchema } from "@/tools/coaAccount/schema";
import { childAccountSchema, type ChildAccountSchema } from "@/tools/childAccount/schema";
import { getContractSchema, type GetContractSchema } from "@/tools/getContract/schema";
import { tokenBalanceSchema, type TokenBalanceSchema } from "@/tools/tokenBalance/schema";

// Define prompt objects
export const getFlowBalancePrompt = {
  name: "flow.getBalance",
  description: "Get the balance of a Flow account",
  schema: flowBalanceSchema,
  handler: ({ address, network = "mainnet" }: FlowBalanceSchema) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please get the balance for Flow account ${address} on the ${network} network.`,
        },
      },
    ],
  }),
};

export const getAccountInfoPrompt = {
  name: "flow.getAccountInfo",
  description: "Get information about a Flow account",
  schema: accountInfoSchema,
  handler: ({ address, network = "mainnet" }: AccountInfoSchema) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please get account information for Flow account ${address} on the ${network} network.`,
        },
      },
    ],
  }),
};

export const getCoaAccountPrompt = {
  name: "flow.findCoaAccounts",
  description: "Find COA accounts associated with an address",
  schema: coaAccountSchema,
  handler: ({ address, network = "mainnet" }: CoaAccountSchema) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please find COA accounts associated with Flow account ${address} on the ${network} network.`,
        },
      },
    ],
  }),
};

export const getChildAccountPrompt = {
  name: "flow.getChildAccount",
  description: "Get child accounts associated with a Flow address",
  schema: childAccountSchema,
  handler: ({ address, network = "mainnet" }: ChildAccountSchema) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please get child accounts for Flow account ${address} on the ${network} network.`,
        },
      },
    ],
  }),
};

export const getContractPrompt = {
  name: "flow.getContract",
  description: "Get the source code of a contract deployed at a specific address",
  schema: getContractSchema,
  handler: ({ address, contractName, network = "mainnet" }: GetContractSchema) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please get the source code for contract ${contractName} deployed at Flow account ${address} on the ${network} network.`,
        },
      },
    ],
  }),
};

export const getTokenBalancePrompt = {
  name: "flow.getTokenBalance",
  description: "Get the balances of all fungible tokens for a Flow address",
  schema: tokenBalanceSchema,
  handler: ({ address, network = "mainnet" }: TokenBalanceSchema) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please get all fungible token balances for Flow account ${address} on the ${network} network.`,
        },
      },
    ],
  }),
};
