import { atom } from "jotai";
import { WidgetScreen } from "../types";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { CONTACT_SESSION_KEY } from "../constants";
import { Id, Doc } from "@workspace/backend/_generated/dataModel";


export const screenAtom = atom<WidgetScreen>("auth");

export const errorMessageAtom = atom<string | null>(null);

export const loadingMessageAtom = atom<string | null>(null);

export const organizationIdAtom = atom<string | null>(null);

export const contactSessionIdAtom = atomFamily(
    (organizationId: string) => {
        return atomWithStorage<Id<"contactSessions"> | null>(`${CONTACT_SESSION_KEY}_${organizationId}`, null)
    }
);

export const conversationIdAtom = atom<Id<"conversations"> | null>(null);

export const widgetSettingsAtom = atom<Pick<Doc<"widgetSettings">, "greetMessage" | "defaultSuggestions" | "vapiSettings"> | null>(null);

export const vapiSecretsAtom = atom<{ publicApiKey: string; } | null>(null);

export const hasVapiSecretsAtom = atom((get) => get(vapiSecretsAtom) !== null);