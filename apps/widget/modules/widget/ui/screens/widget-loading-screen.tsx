"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { contactSessionIdAtom, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom, vapiSecretsAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
import { WidgetHeader } from "../components/widget-header";
import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

interface WidgetLoadingScreenProps {
    organizationId: string | null;
}

type InitStep = "storage" | "org" | "settings" | "vapi" | "done" | "session";

export const WidgetLoadingScreen = ({ organizationId }: WidgetLoadingScreenProps) => {
    const [step, setStep] = useState<InitStep>("org")
    const [sessionValid, setSessionValid] = useState(false);
    const setError = useSetAtom(errorMessageAtom);
    const [loadingMessage, setLoadingMessage] = useAtom(loadingMessageAtom);
    const setOrganizationId = useSetAtom(organizationIdAtom);
    const setScreen = useSetAtom(screenAtom);
    const contactSessionId = useAtomValue(contactSessionIdAtom(organizationId || ""));
    const setWidgetSettings = useSetAtom(widgetSettingsAtom);
    const setVapiSecrets = useSetAtom(vapiSecretsAtom);

    const validateOrganization = useAction(api.public.organizations.validate);
    const validateSession = useMutation(api.public.contactSessions.validate);

    useEffect(() => {
        if (step != "org") return;

        setLoadingMessage("Loading organization data");

        if (!organizationId) {
            setError("Organization ID is required!");
            setScreen("error");
            return;
        }

        setLoadingMessage("Verifying organization");

        validateOrganization({ organizationId: organizationId })
            .then((result) => {
                if (result.valid) {
                    setOrganizationId(organizationId);
                    setStep("session");
                } else {
                    setError(result?.reason || "Inavlid configuration!");
                    setScreen("error");
                }
            })
            .catch(() => {
                setError("Unable to verify!");
                setScreen("error");
            })

    }, [step, organizationId, setError, setScreen, setOrganizationId, setStep, validateOrganization, setLoadingMessage]);

    useEffect(() => {
        if (step != "session") return;

        setLoadingMessage("Finding session...");

        if (!contactSessionId) {
            setSessionValid(false);
            setStep("settings");
            return;
        }

        setLoadingMessage("Verifying session...");

        validateSession({ contactSessionId: contactSessionId })
            .then((result) => {
                setSessionValid(result.valid);
                setStep("settings")
            })
            .catch(() => {
                setSessionValid(false);
                setStep("settings")
            })

    }, [step, contactSessionId, setStep, validateSession, setLoadingMessage, setSessionValid]);

    const widgetSettings = useQuery(api.public.widgetSettings.getByOrganizationId,
        organizationId
            ? { organizationId }
            : "skip"
    );

    useEffect(() => {
        if (step !== "settings") return;

        setLoadingMessage("Loading widget settings...");

        if (widgetSettings !== undefined && organizationId) {
            setWidgetSettings(widgetSettings);
            setStep("vapi");
        }
    }, [setLoadingMessage, setWidgetSettings, step, setStep, widgetSettings, organizationId]);

    const getVapiSecrets = useAction(api.public.secrets.getVapiSecrets);

    useEffect(() => {
        if (step !== "vapi" || !organizationId) return;

        setLoadingMessage("Loading assistants...");

        getVapiSecrets({
            organizationId,
        })
            .then((secrets) => {
                setVapiSecrets(secrets);
                setStep("done");
            })
            .catch(() => {
                setVapiSecrets(null);
                setStep("done");
            });

    }, [setLoadingMessage, setVapiSecrets, step, organizationId, getVapiSecrets]);

    useEffect(() => {
        if (step != "done") return;

        const hasValidSession = contactSessionId && sessionValid;
        setScreen(hasValidSession ? "selection" : "auth");
    }, [step, setScreen, sessionValid, contactSessionId]);

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">Hi there! 👋</p>
                    <p className="text-lg">Let&apos;s get you started</p>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
                <LoaderIcon className="animate-spin" />
                <p className="text-sm">
                    {loadingMessage || "loading..."}
                </p>
            </div>
        </>
    )
}