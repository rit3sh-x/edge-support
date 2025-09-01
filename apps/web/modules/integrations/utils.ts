import { INTEGRATIONS } from "./constants";

export function createScript(integrationId: string, organizationId: string): string | undefined {
    const integration = INTEGRATIONS.find(i => i.id === integrationId);
    if (!integration) return undefined;
    return integration.script.replace(/{{ORGANIZATION_ID}}/g, organizationId);
}