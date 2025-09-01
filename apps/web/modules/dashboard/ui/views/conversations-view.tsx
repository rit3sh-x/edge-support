import Image from "next/image"

export const ConversationsView = () => {
    return (
        <div className="bg-muted fkex h-full flex-1 flex-col gap-y-4">
            <div className="flex flex-1 items-center justify-center gap-x-2">
                <Image
                    alt="edge"
                    src={"/logo.svg"}
                    height={40}
                    width={40}
                />
                <p className="font-semibold text-lg">Edge Support</p>
            </div>
        </div>
    )
}