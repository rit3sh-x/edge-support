"use client";

import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtom, conversationIdAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "@workspace/ui/components/ai/conversation";
import { AIInput, AIInputTextarea, AIInputToolbar, AIInputSubmit, AIInputTools } from "@workspace/ui/components/ai/input";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { Form, FormField } from "@workspace/ui/components/form";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useMemo } from "react";

const formSchema = z.object({
    message: z.string().min(1, "Message is required")
})

export const WidgetChatScreen = () => {
    const [conversationId, setConversationId] = useAtom(conversationIdAtom);
    const organizationId = useAtomValue(organizationIdAtom);
    const widgetSettings = useAtomValue(widgetSettingsAtom);
    const setScreen = useSetAtom(screenAtom);
    const contactSessionId = useAtomValue(contactSessionIdAtom(organizationId || ""));

    const suggestions = useMemo(() => {
        if (!widgetSettings) return [];
        return Object.keys(widgetSettings.defaultSuggestions).map(
            (key) => widgetSettings.defaultSuggestions[key as keyof typeof widgetSettings.defaultSuggestions]
        );
    }, [widgetSettings]);

    const conversation = useQuery(
        api.public.conversations.getOne,
        conversationId && contactSessionId
            ? { conversationId, contactSessionId }
            : "skip"
    );

    const messages = useThreadMessages(api.public.messages.getMany,
        conversation?.threadId && contactSessionId ?
            {
                threadId: conversation.threadId,
                contactSessionId
            } : "skip",
        { initialNumItems: 10 }
    );

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
        status: messages.status,
        loadMore: messages.loadMore,
        loadSize: 10,
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        }
    });

    const createMessage = useAction(api.public.messages.create)

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!conversation || !contactSessionId) return;
        form.reset();

        await createMessage({
            threadId: conversation.threadId,
            prompt: values.message,
            contactSessionId
        });
    }

    return (
        <>
            <WidgetHeader className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <Button size={"icon"} variant={"transparent"} onClick={() => {
                        setConversationId(null);
                        setScreen("selection");
                    }}>
                        <ArrowLeftIcon />
                    </Button>
                    <p>Chat</p>
                    <Button size={"icon"} variant={"transparent"}>
                        <MenuIcon />
                    </Button>
                </div>
            </WidgetHeader>
            <AIConversation>
                <AIConversationContent>
                    <InfiniteScrollTrigger
                        canLoadMore={canLoadMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        ref={topElementRef}
                    />
                    {toUIMessages(messages.results ?? [])?.map((message) => (
                        <AIMessage from={message.role === "user" ? "user" : "assistant"} key={message.id}>
                            <AIMessageContent>
                                <AIResponse>{message.content}</AIResponse>
                            </AIMessageContent>
                            {message.role === "assistant" && (
                                <DicebearAvatar imageUrl={"/logo.svg"} seed={"assistant"} size={32} />
                            )}
                        </AIMessage>
                    ))}
                </AIConversationContent>
                <AIConversationScrollButton />
            </AIConversation>
            {toUIMessages(messages.results ?? []).length <= 1 && (
                <AISuggestions className="flex w-full flex-col items-end p-2">
                    {suggestions.map((suggestion) => {
                        if (!suggestion) return null;

                        return (
                            <AISuggestion key={suggestion} onClick={() => {
                                form.setValue("message", suggestion, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                });
                                form.handleSubmit(onSubmit)();
                            }} suggestion={suggestion} />
                        )
                    })}
                </AISuggestions>
            )}
            <Form {...form}>
                <AIInput onSubmit={form.handleSubmit(onSubmit)} className="rounded-none border-x-0 border-b-0">
                    <FormField
                        control={form.control}
                        disabled={conversation?.status === "resolved"}
                        name="message"
                        render={({ field }: { field: FieldValues }) => (
                            <AIInputTextarea
                                disabled={conversation?.status === "resolved" || form.formState.isSubmitting}
                                onChange={field.onChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        form.handleSubmit(onSubmit)();
                                    }
                                }}
                                placeholder={
                                    conversation?.status === "resolved"
                                        ? "This conversation has been resolved"
                                        : "Type your query..."
                                }
                                value={field.value}
                            />
                        )}
                    />
                    <AIInputToolbar>
                        <AIInputTools />
                        <AIInputSubmit disabled={conversation?.status === "resolved" || !form.formState.isValid} status="ready" type="submit" />
                    </AIInputToolbar>
                </AIInput>
            </Form>
        </>
    )
}