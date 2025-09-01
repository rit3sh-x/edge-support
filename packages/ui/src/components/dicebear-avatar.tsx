"use client";

import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { useMemo } from "react";
import { Avatar, AvatarImage } from "./avatar";
import { cn } from "../lib/utils";

interface DicebearAvatarProps {
    seed: string;
    size?: number;
    className?: string;
    badgeClassName?: string;
    imageUrl?: string;
    badgeImageUrl?: string;
}

export const DicebearAvatar = ({ seed, size = 32, className, badgeClassName, imageUrl, badgeImageUrl }: DicebearAvatarProps) => {
    const avatarSource = useMemo(() => {
        if (imageUrl) return imageUrl;
        const avatar = createAvatar(glass, {
            seed: seed.toLowerCase().trim(),
            size
        })

        return avatar.toDataUri();
    }, [imageUrl, seed, size]);

    const badgeSize = Math.round(size * 0.5);
    return (
        <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
            <Avatar className={cn("border", className)} style={{ width: size, height: size }}>
                <AvatarImage alt="image" src={avatarSource} />
            </Avatar>
            {badgeImageUrl && (
                <div className={cn("absolute right-0 bottom-0 flex items-center justify-center overflow-hidden rounded-full border-2 border-background bg-background", badgeClassName)} style={{ width: badgeSize, height: badgeSize, transform: "translate(15%, 15%)" }}>
                    <img alt="profile" className="h-full w-full object-cover" height={badgeSize} src={badgeImageUrl} width={badgeSize} />
                </div>
            )}
        </div>
    )
}