import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { OPERATOR_MESSAGE_ENHANCEMENT_PROMPT } from "../constants";

export const enhanceResponse = action({
    args: {
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "User isn't logged in."
            })
        }

        const orgId = identity.orgId as string;

        if (orgId === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "User isn't in an Organization."
            })
        }

        const subscription = await ctx.runQuery(internal.system.subscriptions.getByOrganizationId, {
            organizationId: orgId,
        });

        if (subscription?.status !== "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "User isnt on pro plan",
            });
        }

        const response = await generateText({
            model: google.chat("gemini-2.0-flash"),
            messages: [
                {
                    role: "system",
                    content: OPERATOR_MESSAGE_ENHANCEMENT_PROMPT
                }, {
                    role: "user",
                    content: args.prompt
                }
            ]
        });

        return response.text;
    }
})

export const create = mutation({
    args: {
        response: v.string(),
        conversationId: v.id("conversations")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "User isn't logged in."
            })
        }

        const orgId = identity.orgId as string;

        if (orgId === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "User isn't in an Organization."
            })
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            });
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Invalid organization",
            })
        }

        if (conversation.status === "resolved") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Conversation is reoslved"
            });
        }

        if (conversation.status === "unresolved") {
            await ctx.db.patch(args.conversationId, {
                status: "escalated",
            });
        }

        await saveMessage(ctx, components.agent, {
            threadId: conversation.threadId,
            agentName: identity.familyName,
            message: {
                role: "assistant",
                content: args.response
            }
        })
    }
});

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "User isn't logged in."
            })
        }

        const orgId = identity.orgId as string;

        if (orgId === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "User isn't in an Organization."
            })
        }

        const conversation = await ctx.db.query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique()

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation missing",
            })
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Invalid organization",
            })
        }

        const paginated = await supportAgent.listMessages(ctx, {
            threadId: args.threadId,
            paginationOpts: args.paginationOpts
        });

        return paginated;
    }
})