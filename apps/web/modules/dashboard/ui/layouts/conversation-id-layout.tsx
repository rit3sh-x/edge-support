import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable"
import { ContactPanel } from "../components/contact-panel"

export const ConversationIdLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ResizablePanelGroup className="h-full flex-1" direction="horizontal">
            <ResizablePanel defaultSize={60} className="h-full">
                <div className="flex h-full flex-1 flex-col">
                    {children}
                </div>
            </ResizablePanel>
            <ResizableHandle className="hidden lg:block" />
            <ResizablePanel defaultSize={40} maxSize={40} minSize={20} className="hidden lg:block">
                <ContactPanel />
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}