import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { AUTO_REFRESH_THRESHOLD, SESSION_DURATION } from "../constants";

export const refresh = internalMutation({
    args: {
        contactSessionId: v.id("contactSessions")
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.db.get(args.contactSessionId);

        if (!contactSession) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Session is not found",
            });
        }

        if (contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Session is expired",
            });
        }

        const timeRemaining = contactSession.expiresAt - Date.now();

        if (timeRemaining < AUTO_REFRESH_THRESHOLD) {
            const newExpiresAt = Date.now() + SESSION_DURATION;
            await ctx.db.patch(contactSession._id, {
                expiresAt: newExpiresAt,
            });
            return { ...contactSession, expiresAt: newExpiresAt }
        }
        return contactSession;
    }
});

export const getOne = internalQuery({
    args: {
        contactSessionId: v.id("contactSessions")
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.contactSessionId);
    }
})