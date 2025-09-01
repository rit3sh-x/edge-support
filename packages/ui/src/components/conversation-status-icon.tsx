import { CheckIcon, ArrowUpIcon, ArrowRightIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface ConversationStatusIconProps {
    status: "unresolved" | "resolved" | "escalated";
}

const statusConfigs = {
    resolved: {
        icon: CheckIcon,
        bgColor: "bg-[#3fb62]"
    },
    unresolved: {
        icon: ArrowRightIcon,
        bgColor: "bg-destructive"
    },
    escalated: {
        icon: ArrowUpIcon,
        bgColor: "bg-yellow-500"
    },
} as const;

export const ConversationStatusIcon = ({ status }: ConversationStatusIconProps) => {
    const config = statusConfigs[status];
    return (
        <div className={cn(
            "flex items-center justify-center rounded-full size-5",
            config.bgColor
        )}>
            <config.icon className="size-3 stroke-3 text-white" />
        </div>
    )
}