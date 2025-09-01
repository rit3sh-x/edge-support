"use client";

import { api } from "@workspace/backend/_generated/api";
import { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";
import React, { useState } from "react";
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "@workspace/ui/components/ai/conversation";
import { AIInput, AIInputButton, AIInputTextarea, AIInputToolbar, AIInputSubmit, AIInputTools } from "@workspace/ui/components/ai/input";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { ConversationStatusButton } from "../components/conversation-status-button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner"
import { Protect } from "@clerk/nextjs";

const formSchema = z.object({
    message: z.string().min(1, "Message is required")
})

interface ConversationIdViewProps {
    conversationId: Id<"conversations">;
}

export const ConversationIdView = ({ conversationId }: ConversationIdViewProps) => {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const conversation = useQuery(api.private.conversations.getOne, {
        conversationId
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        }
    });

    const messages = useThreadMessages(api.private.messages.getMany,
        conversation?.threadId ? { threadId: conversation.threadId } : "skip",
        { initialNumItems: 10 }
    );

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
        status: messages.status,
        loadMore: messages.loadMore,
        loadSize: 10,
    })

    const createMessage = useMutation(api.private.messages.create)

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createMessage({
                response: values.message,
                conversationId
            });
            form.reset();
        } catch (error) {
            console.log(error)
        }
    };

    const updateStatus = useMutation(api.private.conversations.updateStatus);
    const handleToggleStatus = async () => {
        if (!conversation) return;

        setUpdatingStatus(true);

        let newStatus: Doc<"conversations">["status"];
        if (conversation.status === "unresolved") {
            newStatus = "escalated";
        } else if (conversation.status === "escalated") {
            newStatus = "resolved";
        } else {
            newStatus = "unresolved";
        }

        try {
            updateStatus({
                conversationId: conversation._id,
                status: newStatus
            });
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingStatus(false);
        }
    }

    const enhanceResponse = useAction(api.private.messages.enhanceResponse);
    const handleEnhanceResponse = async () => {
        setIsEnhancing(true);
        const currentValue = form.getValues("message");
        try {
            const response = await enhanceResponse({
                prompt: currentValue
            });
            form.setValue("message", response);
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        } finally {
            setIsEnhancing(false);
        }
    }

    if (conversation === undefined || messages.status === "LoadingFirstPage") {
        return <ConversationViewSkeleton />
    }

    return (
        <div className="flex h-full flex-col bg-muted">
            <header className="flex items-center justify-between border-b bg-background">
                <Button size={"sm"} variant={"ghost"}>
                    <MoreHorizontalIcon />
                </Button>
                {!!conversation && (
                    <ConversationStatusButton onClick={handleToggleStatus} status={conversation.status} disabled={updatingStatus} />
                )}
            </header>
            <AIConversation className="max-h-[calc(100vh-180px)] ">
                <AIConversationContent>
                    <InfiniteScrollTrigger
                        canLoadMore={canLoadMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        ref={topElementRef}
                    />
                    {toUIMessages(messages.results ?? [])?.map((message) => (
                        <AIMessage from={message.role === "user" ? "assistant" : "user"} key={message.id}>
                            <AIMessageContent>
                                <AIResponse>{message.content}</AIResponse>
                            </AIMessageContent>
                            {message.role === "user" && (
                                <DicebearAvatar seed={conversation?.contactSessionId ?? "user"} size={32} />
                            )}
                        </AIMessage>
                    ))}
                </AIConversationContent>
                <AIConversationScrollButton />
            </AIConversation>
            <div className="p-2">
                <Form {...form}>
                    <AIInput onSubmit={form.handleSubmit(onSubmit)} className="rounded-none border-x-0 border-b-0">
                        <FormField
                            control={form.control}
                            disabled={conversation?.status === "resolved"}
                            name="message"
                            render={({ field }: { field: FieldValues }) => (
                                <AIInputTextarea
                                    disabled={conversation?.status === "resolved" || form.formState.isSubmitting || isEnhancing}
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
                                            : "Type your response as operator..."
                                    }
                                    value={field.value}
                                />
                            )}
                        />
                        <AIInputToolbar>
                            <AIInputTools>
                                <Protect
                                    condition={(has) => has({ plan: 'pro' })}
                                    fallback={null}
                                >
                                    <AIInputButton disabled={conversation?.status === "resolved" || !form.formState.isValid || form.formState.isSubmitting || isEnhancing} onClick={() => handleEnhanceResponse()}>
                                        <Wand2Icon />
                                        {isEnhancing ? "Enhancing..." : "Enhance"}
                                    </AIInputButton>
                                </Protect>
                            </AIInputTools>
                            <AIInputSubmit disabled={conversation?.status === "resolved" || !form.formState.isValid || form.formState.isSubmitting || isEnhancing} status="ready" type="submit" />
                        </AIInputToolbar>
                    </AIInput>
                </Form>
            </div>
        </div>
    );
};

const ConversationViewSkeleton = () => {
    return (
        <div className="flex h-full flex-col bg-muted">
            <header className="flex items-center justify-between border-b bg-background p-2.5">
                <Button disabled size={"sm"} variant={"ghost"}>
                    <MoreHorizontalIcon />
                </Button>
            </header>
            <AIConversation className="max-h-[calc(100vh-180px)]">
                <AIConversationContent>
                    {Array.from({ length: 8 }).map((_, i) => {
                        const isUser = i % 2 === 0;
                        const width = Math.floor(Math.random() * (260 - 180 + 1)) + 180;
                        return (
                            <div className={cn(
                                "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-80%",
                                isUser ? "is-user" : "is-assistant flex-row-reverse"
                            )}
                                key={i}
                            >
                                <Skeleton className={`h-9 w-[${width}px] rounded-lg bg-neutral-200`} />
                                <Skeleton className={`size-8 rounded-full bg-neutral-200`} />
                            </div>
                        );
                    })}
                </AIConversationContent>
            </AIConversation>
            <div className="p-2">
                <AIInput>
                    <AIInputTextarea disabled placeholder="Type your response as operator..." />
                </AIInput>
                <AIInputToolbar>
                    <AIInputTools>
                        <AIInputSubmit disabled status="ready" />
                    </AIInputTools>
                </AIInputToolbar>
            </div>
        </div>
    );
};