import { definePlaygroundAPI } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { supportAgent } from "./system/ai/agents/supportAgent";

export const {
  isApiKeyValid,
  listAgents,
  listUsers,
  listThreads,
  listMessages,
  createThread,
  generateText,
  fetchPromptContext,
} = definePlaygroundAPI(components.agent, {
  agents: [supportAgent],
});