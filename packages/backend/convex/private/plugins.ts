import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getOne = query({
    args: {
        service: v.union(
            v.literal("vapi"),
        ),
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

        return await ctx.db
            .query("plugins")
            .withIndex("by_organization_id_and_service", (q) =>
                q.eq("organizationId", orgId).eq("service", args.service)
            )
            .unique();
    }
});

export const remove = mutation({
    args: {
        service: v.union(
            v.literal("vapi"),
        ),
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

        const existingPlugin = await ctx.db
            .query("plugins")
            .withIndex("by_organization_id_and_service", (q) =>
                q.eq("organizationId", orgId).eq("service", args.service)
            )
            .unique();

        if (!existingPlugin) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Plugin not found."
            })
        }

        await ctx.db.delete(existingPlugin._id);
    }
});