import { flowBalanceTool } from "./flowBalance/index.js";
import { tokenBalanceTool } from "./tokenBalance/index.js";
import { coaAccountTool } from "./coaAccount/index.js";
import { getContractTool } from "./getContract/index.js";
import { accountInfoTool } from "./accountInfo/index.js";
import { childAccountTool } from "./childAccount/index.js";
import type { ToolRegistration } from "../types/tools.js";

// biome-ignore lint/suspicious/noExplicitAny: Any is fine here because all tools validate their input schemas.
export const createTools = (): ToolRegistration<any>[] => {
  return [flowBalanceTool, tokenBalanceTool, coaAccountTool, getContractTool, accountInfoTool, childAccountTool];
};

export default createTools;
