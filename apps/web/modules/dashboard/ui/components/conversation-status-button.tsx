import { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Hint } from "@workspace/ui/components/hint"
import { ArrowUpIcon, CheckIcon, ArrowRightIcon } from "lucide-react";

interface ConversationStatusButtonProps {
    status: Doc<"conversations">["status"];
    onClick: () => void;
    disabled: boolean;
}

export const ConversationStatusButton = ({ onClick, status, disabled }: ConversationStatusButtonProps) => {
    if (status == "resolved") {
        return (
            <Hint text="Mark as Unresolved">
                <Button disabled={disabled} onClick={onClick} size={"sm"} variant={"tertiary"}>
                    <CheckIcon />
                    Resolved
                </Button>
            </Hint>
        )
    }
    if (status == "escalated") {
        return (
            <Hint text="Mark as Resolved">
                <Button disabled={disabled} onClick={onClick} size={"sm"} variant={"warning"}>
                    <ArrowUpIcon />
                    Escalted
                </Button>
            </Hint>
        )
    }

    return (
        <Hint text="Mark as Escalated">
            <Button disabled={disabled} onClick={onClick} size={"sm"} variant={"destructive"}>
                <ArrowRightIcon />
                Unresolved
            </Button>
        </Hint>
    )
}