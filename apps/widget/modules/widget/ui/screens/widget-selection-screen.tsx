"use client";

import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ChevronRightIcon, MessageSquareTextIcon, MicIcon, PhoneIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtom, conversationIdAtom, errorMessageAtom, hasVapiSecretsAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { WidgetFooter } from "../components/widget-footer";

export const WidgetSelectionScreen = () => {
    const setScreen = useSetAtom(screenAtom);
    const setError = useSetAtom(errorMessageAtom);
    const organizationId = useAtomValue(organizationIdAtom);
    const contactSessionId = useAtomValue(contactSessionIdAtom(organizationId || ""));
    const setConversationId = useSetAtom(conversationIdAtom);
    const [isPending, setIsPending] = useState(false);
    const widgetSettings = useAtomValue(widgetSettingsAtom);
    const hasVapiSecrets = useAtomValue(hasVapiSecretsAtom);

    const createConversation = useMutation(api.public.conversations.create);

    const handleNewChat = async () => {
        setIsPending(true);
        if (!organizationId) {
            setScreen("error");
            setError("Missing organization data");
            return;
        }
        if (!contactSessionId) {
            setScreen("auth");
            return;
        }

        try {
            const conversationId = await createConversation({
                contactSessionId,
                organizationId
            })
            setConversationId(conversationId);
            setScreen("chat");
        } catch {
            setScreen("auth");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">Hi there! 👋</p>
                    <p className="text-lg">Let&apos;s get you started</p>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col gap-y-4 p-4 overflow-y-auto">
                <Button className="h-16 w-full justify-between" variant={"outline"} onClick={() => { handleNewChat }} disabled={isPending}>
                    <div className="flex items-center gap-x-2">
                        <MessageSquareTextIcon className="size-4" />
                        <span>Start Chat</span>
                    </div>
                    <ChevronRightIcon />
                </Button>
                {hasVapiSecrets && widgetSettings?.vapiSettings.assistantId && (
                    <Button className="h-16 w-full justify-between" variant={"outline"} onClick={() => { setScreen("voice") }} disabled={isPending}>
                        <div className="flex items-center gap-x-2">
                            <MicIcon className="size-4" />
                            <span>Start Voice Call</span>
                        </div>
                        <ChevronRightIcon />
                    </Button>
                )}
                {hasVapiSecrets && widgetSettings?.vapiSettings.phoneNumber && (
                    <Button className="h-16 w-full justify-between" variant={"outline"} onClick={() => { setScreen("contact") }} disabled={isPending}>
                        <div className="flex items-center gap-x-2">
                            <PhoneIcon className="size-4" />
                            <span>Call Us</span>
                        </div>
                        <ChevronRightIcon />
                    </Button>
                )}
            </div>
            <WidgetFooter />
        </>
    )
}