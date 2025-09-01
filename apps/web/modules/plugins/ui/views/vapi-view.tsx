"use client";

import { GlobeIcon, PhoneCallIcon, PhoneIcon, WorkflowIcon } from "lucide-react";
import { Features, PluginCard } from "../components/plugin-card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@workspace/ui/components/dialog";
import { Form, FormField, FormControl, FormItem, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button";
import { VapiConnectedView } from "../components/vapi-connected-view";

const vapiFeatures: Features[] = [
    {
        icon: GlobeIcon,
        label: "Web voice calls",
        description: "Voice chat directly in you app"
    },
    {
        icon: PhoneCallIcon,
        label: "Outbound calls",
        description: "Automated customer outreach"
    },
    {
        icon: PhoneIcon,
        label: "Phone numbers",
        description: "Get dedicated business lines"
    },
    {
        icon: WorkflowIcon,
        label: "Workflows",
        description: "Custom conversation flows"
    },
]

const formSchema = z.object({
    publicApiKey: z.string().min(1, { message: "Public API key is needed" }),
    privateApiKey: z.string().min(1, { message: "Public api key is needed" }),
});

const VapiPluginForm = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
    const upsertSecret = useMutation(api.private.secrets.upsert);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            privateApiKey: "",
            publicApiKey: "",
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await upsertSecret({
                service: "vapi",
                value: {
                    publicApiKey: values.publicApiKey,
                    privateApiKey: values.privateApiKey
                }
            })
            setOpen(false);
            toast.success("Keys submitted successfully")
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enable Vapi</DialogTitle>
                </DialogHeader>
                <DialogDescription>Your API keys are securely stored by our platform.</DialogDescription>
                <Form {...form}>
                    <form className="flex flex-col gap-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField control={form.control} name="publicApiKey" render={({ field }: { field: FieldValues }) => (
                            <FormItem>
                                <Label>Public API Key</Label>
                                <FormControl>
                                    <Input {...field} placeholder="Your public API key" type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="privateApiKey" render={({ field }: { field: FieldValues }) => (
                            <FormItem>
                                <Label>Private API Key</Label>
                                <FormControl>
                                    <Input {...field} placeholder="Your private API key" type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button disabled={form.formState.isSubmitting} type="submit">
                                {form.formState.isSubmitting ? "Connecting..." : "Connect"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

const VapiPluginDisconnectForm = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
    const removePlugin = useMutation(api.private.plugins.remove);

    const onSubmit = async () => {
        try {
            await removePlugin({
                service: "vapi",
            })
            setOpen(false);
            toast.success("Vapi plugin removed.")
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Disconnect Vapi</DialogTitle>
                </DialogHeader>
                <DialogDescription>Are you sure you want to disconnect Vapi plugin?</DialogDescription>
                <DialogFooter>
                    <Button onClick={onSubmit} variant={"destructive"}>
                        Disconnect
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}

export const VapiView = () => {
    const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });
    const [connectOpen, setConnectOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);

    const toggleConnection = () => {
        if (vapiPlugin) {
            setRemoveOpen(true);
        } else {
            setConnectOpen(true);
        }
    }

    return (
        <>
            <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
            <VapiPluginDisconnectForm open={removeOpen} setOpen={setRemoveOpen} />
            <div className="flex min-h-screen flex-col bg-muted p-8">
                <div className="mx-auto w-full max-w-screen-md">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl">Vapi Plugin</h1>
                        <p className="text-muted-foreground">Connect Vapi to enable AI voice calls and phone support</p>
                    </div>
                    <div className="mt-8">
                        {vapiPlugin ? (
                            <VapiConnectedView onDisconnect={toggleConnection} />
                        ) : (
                            <PluginCard
                                serviceName="Vapi"
                                serviceImage="/vapi.jpg"
                                features={vapiFeatures}
                                isDisabled={vapiPlugin === undefined}
                                onSubmit={toggleConnection}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}