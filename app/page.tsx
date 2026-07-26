import { AppSidebar } from "@/components/app-sidebar"
import { LoungeView } from "@/components/lounge-view"
import { StudyProvider } from "@/components/study-provider"
import { AuthGate } from "@/components/auth-gate"

export default function Page() {
  return (
    <StudyProvider>
      <AuthGate>
        <div className="flex min-h-dvh flex-col md:flex-row">
          <AppSidebar />
          <LoungeView />
        </div>
      </AuthGate>
    </StudyProvider>
  )
}
