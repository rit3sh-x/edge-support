"use client";

import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useQuery } from "convex/react";
import { ClockIcon, GlobeIcon, MailIcon, MonitorIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import Bowser from "bowser";

type ItemInfo = {
    label: string;
    value: string | React.ReactNode;
    className?: string;
};

type InfoSelection = {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    items: ItemInfo[];
}

export const ContactPanel = () => {
    const params = useParams();
    const conversationId = params.conversationId as Id<"conversations"> | null;

    const contactSession = useQuery(api.private.contactSessions.getOneByConversationId,
        conversationId
            ? { conversationId }
            : "skip"
    );

    const parseUserAgent = useMemo(() => {
        return (userAgent?: string) => {
            if (!userAgent) {
                return { browser: "Unknown", os: "Unknown", device: "Unknown" }
            }
            const bowser = Bowser.getParser(userAgent);
            const result = bowser.getResult();

            return {
                browser: result.browser.name || "Unknown",
                browserVersion: result.browser.version || "",
                os: result.os.name || "Unknown",
                osVersion: result.os.version || "",
                device: result.platform.type || "desktop",
                deviceVendor: result.platform.vendor || "",
                deviceModel: result.platform.model || "",
            }
        }
    }, []);

    const userAgentInfo = useMemo(() => {
        return parseUserAgent(contactSession?.metadata?.userAgent);
    }, [contactSession?.metadata?.userAgent, parseUserAgent]);

    const countryInfo = useMemo(() => {
        return getCountryFromTimezone(contactSession?.metadata?.timezone);
    }, [contactSession?.metadata?.timezone]);

    const accordionSections = useMemo<InfoSelection[]>(() => {
        if (!contactSession || !contactSession.metadata) return [];

        return [
            {
                id: "device-info",
                icon: MonitorIcon,
                title: "Device Information",
                items: [
                    {
                        label: "Browser",
                        value: userAgentInfo.browser + (userAgentInfo.browserVersion ? ` ${userAgentInfo.browserVersion}` : ""),
                    },
                    {
                        label: "OS",
                        value: userAgentInfo.os + (userAgentInfo.osVersion ? ` ${userAgentInfo.osVersion}` : ""),
                    },
                    {
                        label: "Device",
                        value: userAgentInfo.device + (userAgentInfo.deviceModel ? ` ${userAgentInfo.deviceModel}` : ""),
                        className: "capitalize"
                    },
                    {
                        label: "Screen",
                        value: contactSession.metadata.screenResolution,
                    },
                    {
                        label: "Viewport",
                        value: contactSession.metadata.viewportSize,
                    },
                    {
                        label: "Cookies",
                        value: contactSession.metadata.cookieEnabled ? "Enabled" : "Disabled",
                    },
                ]
            },
            {
                id: "location-info",
                icon: GlobeIcon,
                title: "Location & Language",
                items: [
                    ...(countryInfo
                        ? [
                            {
                                label: "Country",
                                value: (
                                    <span>
                                        {countryInfo.name}
                                    </span>
                                )
                            }
                        ]
                        : []
                    ),
                    {
                        label: "Language",
                        value: contactSession.metadata.languages
                    },
                    {
                        label: "Timezone",
                        value: contactSession.metadata.timezone
                    },
                    {
                        label: "UTC Offset",
                        value: (() => {
                            const offset = contactSession.metadata.timeOffset;
                            if (typeof offset !== "number") return offset;
                            const hours = (-1 * offset) / 60;
                            const sign = hours >= 0 ? "+" : "-";
                            const absHours = Math.floor(Math.abs(hours));
                            const absMinutes = Math.abs(Math.round((Math.abs(hours) - absHours) * 60));
                            return `UTC${sign}${absHours.toString().padStart(2, "0")}:${absMinutes
                                .toString()
                                .padStart(2, "0")}`;
                        })()
                    },
                ]
            },
            {
                id: "session-info",
                icon: ClockIcon,
                title: "Session Details",
                items: [
                    {
                        label: "Session Started",
                        value: new Date(contactSession._creationTime).toLocaleString(),
                    },
                ]
            },
        ]
    }, [contactSession, userAgentInfo, countryInfo]);

    if (contactSession === undefined || contactSession === null) {
        return null;
    }

    return (
        <div className="flex h-full w-full flex-col bg-background text-foreground">
            <div className="flex flex-col gap-y-4 p-4">
                <div className="flex items-center gap-x-2">
                    <DicebearAvatar
                        size={42}
                        badgeImageUrl={
                            countryInfo?.code
                                ? getCountryFlagUrl(countryInfo.code)
                                : undefined
                        }
                        seed={contactSession?._id}
                    />
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-x-2">
                            <h4 className="line-clamp-1">
                                {contactSession.name}
                            </h4>
                        </div>
                        <p className="line-clamp-1 text-muted-foreground text-sm">{contactSession.email}</p>
                    </div>
                </div>
                <Button asChild className="w-full" size="lg">
                    <Link href={`mailto:${contactSession.email}`}>
                        <MailIcon />
                        <span>Send mail</span>
                    </Link>
                </Button>
            </div>
            <div>
                {contactSession.metadata && (
                    <Accordion className="w-full rounded-none border-y" collapsible type="single">
                        {accordionSections.map((section) => (
                            <AccordionItem key={section.id} value={section.id} className="rounded-none outline-none has-focus-visible::z-10 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50">
                                <AccordionTrigger className="flex w-full flex-1 items-start justify-between gap-4 rounded-none bg-accent px-5 py-4 text-left font-medium text-sm outline-none transition-all hover:no-underline disabled:pointer-events-none disabled:opacity-50">
                                    <div className="flex items-center gap-4">
                                        <section.icon className="size-4 shrink-0" />
                                        <span>{section.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 py-4">
                                    <div className="space-y-2 text-sm">
                                        {section.items.map((item) => (
                                            <div className="flex justify-between" key={`${item.label}-${section.id}`}>
                                                <span className="text-muted-foreground">{item.label}:</span>
                                                <span className={item.className}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    )
}