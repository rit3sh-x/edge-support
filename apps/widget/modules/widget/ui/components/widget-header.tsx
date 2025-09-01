import { cn } from "@workspace/ui/lib/utils";
import React from "react";

interface HeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const WidgetHeader = ({ children, className }: HeaderProps) => {
    return (
        <header className={cn("bg-gradient-to-b from-primary to-[#0b63f3] text-primary-foreground", className)}>
            {children}
        </header>
    )
}