"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "./tooltip";

interface HintProps {
    children: React.ReactNode;
    text: string;
    side?: "top" | "left" | "bottom" | "right";
    align?: "start" | "center" | "end";
}

export const Hint = ({ children, text, align = "center", side = "top" }: HintProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    <p>
                        {text}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}