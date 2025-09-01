import { Button } from "./button";
import { cn } from "../lib/utils";

interface InfiniteScrollTriggerProps {
    canLoadMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    noMoreText?: string;
    className?: string;
    loadMoreText?: string;
    ref?: React.Ref<HTMLDivElement>
}

export const InfiniteScrollTrigger = ({ canLoadMore, isLoadingMore, onLoadMore, noMoreText = "No more items", className, loadMoreText = "Load more", ref }: InfiniteScrollTriggerProps) => {
    let text = loadMoreText;

    if (isLoadingMore) text = "Loading...";
    else if (!canLoadMore) text = noMoreText;

    return (
        <div className={cn("flex w-full justify-center py-2", className)} ref={ref}>
            <Button disabled={!canLoadMore || isLoadingMore} onClick={onLoadMore} size={"sm"} variant={"ghost"}>
                {text}
            </Button>
        </div>
    )
}