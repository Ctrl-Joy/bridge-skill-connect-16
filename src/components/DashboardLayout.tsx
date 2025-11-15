import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export const DashboardLayout = () => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(!showProfile)}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                {showProfile ? "Hide Profile" : "View Profile"}
              </Button>
            </div>
            <Outlet />
          </div>
        </main>

        <ProfileSidebar open={showProfile} onClose={() => setShowProfile(false)} />
      </div>
    </SidebarProvider>
  );
};
