"use client";

import { Doc } from "@workspace/backend/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { VapiFormFields } from "./vapi-form-fields"
import { FormSchema, widgetSettingsSchema } from "../../constants";

interface CustomizationFormProps {
    initialData: Doc<"widgetSettings"> | null;
    hasVapiPlugin: boolean
}

export const CustomizationForm = ({ initialData, hasVapiPlugin }: CustomizationFormProps) => {
    const upsertWidgetSettins = useMutation(api.private.widgetSettings.upsert);
    const form = useForm<FormSchema>({
        resolver: zodResolver(widgetSettingsSchema),
        defaultValues: {
            greetMessage: initialData?.greetMessage || "Hi! How can I help you today?",
            defaultSuggestions: {
                suggestion1: initialData?.defaultSuggestions.suggestion1 || "",
                suggestion2: initialData?.defaultSuggestions.suggestion2 || "",
                suggestion3: initialData?.defaultSuggestions.suggestion3 || "",
            },
            vapiSettings: {
                assistantId: initialData?.vapiSettings.assistantId || "",
                phoneNumber: initialData?.vapiSettings.phoneNumber || ""
            }
        }
    });

    const onSubmit = async (values: FormSchema) => {
        try {
            const vapiSettings: Doc<"widgetSettings">["vapiSettings"] = {
                assistantId: values.vapiSettings.assistantId === "none" ? "" : values.vapiSettings.assistantId,
                phoneNumber: values.vapiSettings.phoneNumber === "none" ? "" : values.vapiSettings.phoneNumber,
            }
            await upsertWidgetSettins({
                greetMessage: values.greetMessage,
                vapiSettings,
                defaultSuggestions: values.defaultSuggestions,
            });
            toast.success("Widget settings saved");
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong!")
        }
    }

    return (
        <div>
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>General Chat Settings</CardTitle>
                            <CardDescription>Configure basic chat widget behaviour and messages</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="greetMessage"
                                render={({ field }: { field: FieldValues }) => (
                                    <FormItem>
                                        <FormLabel>Greeting Message</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Welcome message shown when chat opens" rows={3} />
                                        </FormControl>
                                        <FormDescription>The first message the customers see when they open the chat</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Separator />
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-4 text-sm">Default Suggestions</h3>
                                    <p className="mb-4 text-muted-foreground text-sm">Quick replies suggestions shown to customers to help guide the conversation</p>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="defaultSuggestions.suggestion1"
                                            render={({ field }: { field: FieldValues }) => (
                                                <FormItem>
                                                    <FormLabel>Suggestion 1</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. How do I get started?" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="defaultSuggestions.suggestion2"
                                            render={({ field }: { field: FieldValues }) => (
                                                <FormItem>
                                                    <FormLabel>Suggestion 2</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. What are your pricing plans?" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="defaultSuggestions.suggestion3"
                                            render={({ field }: { field: FieldValues }) => (
                                                <FormItem>
                                                    <FormLabel>Suggestion 3</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. I need help with my account?" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {hasVapiPlugin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Assistant Settings</CardTitle>
                                <CardDescription>Configure voice calling features powered by Vapi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <VapiFormFields form={form} />
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end">
                        <Button disabled={form.formState.isSubmitting} type="submit">
                            Save Settings
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}