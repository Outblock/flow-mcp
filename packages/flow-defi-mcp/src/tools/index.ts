import type { ToolRegistration } from "../types/tools.js";
import { getTokenPriceTool } from "./getTokenPrice/index.js";
import { getTrendingPoolsTool } from "./getTrendingPools/index.js";
import { getPoolsByTokenTool } from "./getPoolsByToken/index.js";
import { getTokenInfoTool } from "./getTokenInfo/index.js";
import { getTokenPriceHistoryTool } from "./getTokenPriceHistory/index.js";
import { punchswapQuoteTool, punchswapSwapTool } from "./swap/index.js";
import { getErc20TokensTool, transferErc20TokenTool } from "./erc20/index.js";
import { getEVMTransactionTool } from "./flowscan/index.js";
import { getFlowHistoryPriceTool } from "./getFlowHistoryPrice/index.js";

// biome-ignore lint/suspicious/noExplicitAny: Any is fine here because all tools validate their input schemas.
export const createTools = (): ToolRegistration<any>[] => {
  return [
    getTokenPriceTool,
    getTrendingPoolsTool,
    getPoolsByTokenTool,
    getTokenInfoTool,
    getTokenPriceHistoryTool,
    punchswapQuoteTool,
    punchswapSwapTool,
    getErc20TokensTool,
    transferErc20TokenTool,
    getEVMTransactionTool,
    getFlowHistoryPriceTool,
  ];
};

export default createTools;
