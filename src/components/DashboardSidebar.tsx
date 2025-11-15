import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Network,
  Users,
  UserPlus,
  MessageCircleQuestion,
  BookOpen,
  Trophy,
  FlaskConical,
  Award,
  GraduationCap,
} from "lucide-react";

const menuItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "AI Skill Graph", url: "/dashboard/skill-graph", icon: Network },
  { title: "Find Mentor", url: "/dashboard/mentor", icon: UserPlus },
  { title: "Team Builder", url: "/dashboard/team-builder", icon: Users },
  { title: "Doubt Solver", url: "/dashboard/doubt-solver", icon: MessageCircleQuestion },
  { title: "Department Hub", url: "/dashboard/department-hub", icon: BookOpen },
  { title: "Clubs & Societies", url: "/dashboard/clubs", icon: Trophy },
  { title: "Research Hub", url: "/dashboard/research", icon: FlaskConical },
  { title: "Leaderboard", url: "/dashboard/leaderboard", icon: Award },
];

export function DashboardSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <div className="p-4 border-b flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-primary" />
        {open && <span className="font-semibold text-lg">UniBridge</span>}
      </div>
      
      <SidebarTrigger className="m-2" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
