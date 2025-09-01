import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { escalateConversation, resolveConversation } from "../system/ai/tools/conversationStatus";
import { search } from "../system/ai/tools/search";

export const create = action({
    args: {
        prompt: v.string(),
        threadId: v.string(),
        contactSessionId: v.id("contactSessions")
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.runQuery(internal.system.contactSessions.getOne, {
            contactSessionId: args.contactSessionId
        });

        if (!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            });
        }

        const conversation = await ctx.runQuery(internal.system.conversations.getByThreadId, {
            threadId: args.threadId
        })

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            });
        }

        if (conversation.status === "resolved") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Conversation is reoslved"
            });
        }

        await ctx.runMutation(internal.system.contactSessions.refresh, {
            contactSessionId: args.contactSessionId,
        });

        const subscription = await ctx.runQuery(internal.system.subscriptions.getByOrganizationId, {
            organizationId: conversation.organizationId,
        });

        const shouldTriggerAgent = conversation.status === "unresolved" && subscription?.status === "active";

        if (shouldTriggerAgent) {
            await supportAgent.generateText(
                ctx,
                {
                    threadId: args.threadId
                },
                {
                    prompt: args.prompt,
                    tools: {
                        resolveConversationTool: resolveConversation,
                        escalateConversationTool: escalateConversation,
                        searchTool: search,
                    }
                }
            )
        } else {
            await supportAgent.saveMessage(
                ctx,
                {
                    threadId: args.threadId,
                    prompt: args.prompt
                }
            )
        }
    }
});

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
        contactSessionId: v.id("contactSessions")
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.db.get(args.contactSessionId);

        if (!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            });
        }

        const paginated = await supportAgent.listMessages(ctx, {
            threadId: args.threadId,
            paginationOpts: args.paginationOpts
        });

        return paginated;
    }
})