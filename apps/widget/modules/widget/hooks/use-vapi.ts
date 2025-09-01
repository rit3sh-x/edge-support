import Vapi from "@vapi-ai/web"
import { useAtomValue } from "jotai";
import { useState, useEffect } from "react"
import { vapiSecretsAtom, widgetSettingsAtom } from "../atoms/widget-atoms";

interface TranscriptMessage {
    role: "user" | "assistant";
    text: string;
}

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const vapiSecrets = useAtomValue(vapiSecretsAtom);
    const widgetSettings = useAtomValue(widgetSettingsAtom);

    useEffect(() => {
        if (!vapiSecrets) return;

        const vapiInstance = new Vapi(vapiSecrets.publicApiKey);
        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
            setIsConnected(true),
                setIsConnecting(false),
                setTranscript([]);
        });

        vapiInstance.on("call-end", () => {
            setIsConnected(false),
                setIsConnecting(false),
                setTranscript([]);
        });

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        });
        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        });

        vapiInstance.on("error", (error) => {
            setIsConnecting(false),
                console.error("❌ Vapi Instance error ", error);
        });

        vapiInstance.on("message", (message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role === "user" ? "user" : "assistant",
                        text: message.transcript
                    }
                ])
            }
        });

        return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
        if (!vapiSecrets || !widgetSettings?.vapiSettings.assistantId) return;

        setIsConnecting(true);

        if (vapi) {
            vapi.start(widgetSettings.vapiSettings.assistantId);
        }
    }

    const endCall = () => {
        if (!vapiSecrets || !widgetSettings?.vapiSettings.assistantId) return;

        setIsConnecting(true);

        if (vapi) {
            vapi.stop();
        }
    }

    return {
        isSpeaking,
        isConnected,
        isConnecting,
        transcript,
        startCall,
        endCall
    }
}