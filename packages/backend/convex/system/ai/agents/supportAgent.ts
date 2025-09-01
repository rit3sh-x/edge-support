import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api"
import { google } from "@ai-sdk/google";
import { SUPPORT_AGENT_PROMPT } from "../../../constants";

export const supportAgent = new Agent(components.agent, {
  name: "Support Agent",
  chat: google.chat("gemini-2.5-pro"),
  instructions: SUPPORT_AGENT_PROMPT,
});