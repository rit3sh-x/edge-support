"use client";

import { BotIcon } from "lucide-react";
import { Table, TableRow, TableHead, TableBody, TableCell, TableHeader } from "@workspace/ui/components/table";
import { useVapiAssistants } from "../../hooks/use-vapi-data";

export const VapiAssistantsTab = () => {
    const { data, isLoading } = useVapiAssistants();

    return (
        <div className="border-t bg-background">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-6 py-4">
                            Assistant
                        </TableHead>
                        <TableHead className="px-6 py-4">
                            Model
                        </TableHead>
                        <TableHead className="px-6 py-4">
                            First Message
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(() => {
                        if (isLoading) {
                            return (
                                <TableRow>
                                    <TableCell colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                        Loading assistants...
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        if (data.length === 0) {
                            return (
                                <TableRow>
                                    <TableCell colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                        No assistants configured!
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        return data.map((assistant) => (
                            <TableRow className="hover:bg-muted/50" key={assistant.id}>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <BotIcon className="size-4 text-muted-foreground" />
                                        <span className="font-mono">{assistant.name || "Unnamed Assistant"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <span className="text-sm">{assistant.model?.model || "Not configured"}</span>
                                </TableCell>
                                <TableCell className="max-w-xs px-6 py-4">
                                    <span className="truncate text-muted-foreground text-sm">{assistant.firstMessage || "No greeting configured."}</span>
                                </TableCell>
                            </TableRow>
                        ))
                    })()}
                </TableBody>
            </Table>
        </div>
    )
}