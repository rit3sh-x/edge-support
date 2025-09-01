import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout"

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}