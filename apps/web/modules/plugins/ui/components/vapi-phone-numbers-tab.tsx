"use client";

import { CheckCircleIcon, PhoneIcon, XCircleIcon } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Table, TableRow, TableHead, TableBody, TableCell, TableHeader } from "@workspace/ui/components/table";
import { useVapiPhoneNumbers } from "../../hooks/use-vapi-data";

export const VapiPhoneNumbersTab = () => {
    const { data, isLoading } = useVapiPhoneNumbers();

    return (
        <div className="border-t bg-background">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-6 py-4">
                            Phone Number
                        </TableHead>
                        <TableHead className="px-6 py-4">
                            Name
                        </TableHead>
                        <TableHead className="px-6 py-4">
                            Status
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(() => {
                        if (isLoading) {
                            return (
                                <TableRow>
                                    <TableCell colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                        Loading phone numbers...
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        if (data.length === 0) {
                            return (
                                <TableRow>
                                    <TableCell colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                        No phone numbers configured!
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        return data.map((phone) => (
                            <TableRow className="hover:bg-muted/50" key={phone.id}>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <PhoneIcon className="size-4 text-muted-foreground" />
                                        <span className="font-mono">{phone.number || "Not configured"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <span>{phone.name || "Unnamed"}</span>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge className="capitalize" variant={phone.status === "active" ? "default" : "destructive"}>
                                        {phone.status === "active" && (
                                            <CheckCircleIcon className="mr-1 size-3" />
                                        )}
                                        {phone.status !== "active" && (
                                            <XCircleIcon className="mr-1 size-3" />
                                        )}
                                        <span>{phone.status || "Unknown"}</span>
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    })()}
                </TableBody>
            </Table>
        </div>
    )
}