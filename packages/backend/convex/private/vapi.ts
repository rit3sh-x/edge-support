import { Vapi, VapiClient } from "@vapi-ai/server-sdk";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getSecretValue, parseSecretString } from "../lib/secrets";
import { ConvexError } from "convex/values";

export const getPhoneNumbers = action({
    args: {},
    handler: async (ctx, args): Promise<Vapi.PhoneNumbersListResponseItem[]> => {
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

        const plugin = await ctx.runQuery(internal.system.plugins.getByOrganizationIdAndService, {
            organizationId: orgId,
            service: "vapi",
        });

        if (!plugin) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Plugin not found."
            });
        }

        const secret = await getSecretValue(plugin.secretName);
        const secretData = parseSecretString<{
            privateApiKey: string;
            publicApiKey: string;
        }>(secret);

        if (!secretData) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials not found."
            });
        }

        if (!secretData.privateApiKey || !secretData.publicApiKey) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials incorrect. Please reconnect your Vapi account."
            });
        }

        const vapiClient = new VapiClient({
            token: secretData.privateApiKey,
        });

        const phoneNumbers = await vapiClient.phoneNumbers.list();

        return phoneNumbers;
    }
});

export const getAssistants = action({
    args: {},
    handler: async (ctx, args): Promise<Vapi.Assistant[]> => {
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

        const plugin = await ctx.runQuery(internal.system.plugins.getByOrganizationIdAndService, {
            organizationId: orgId,
            service: "vapi",
        });

        if (!plugin) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Plugin not found."
            });
        }

        const secret = await getSecretValue(plugin.secretName);
        const secretData = parseSecretString<{
            privateApiKey: string;
            publicApiKey: string;
        }>(secret);

        if (!secretData) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials not found."
            });
        }

        if (!secretData.privateApiKey || !secretData.publicApiKey) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials incorrect. Please reconnect your Vapi account."
            });
        }

        const vapiClient = new VapiClient({
            token: secretData.privateApiKey,
        });

        const assistants = await vapiClient.assistants.list();

        return assistants;
    }
});