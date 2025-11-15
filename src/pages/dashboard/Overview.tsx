import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Network,
  Users,
  UserPlus,
  MessageCircleQuestion,
  BookOpen,
  Trophy,
  FlaskConical,
  Award,
} from "lucide-react";

interface Profile {
  name: string;
  department: string;
  year: number;
}

const quickActions = [
  {
    title: "AI Skill Graph",
    description: "Visualize your skills and connections",
    icon: Network,
    href: "/dashboard/skill-graph",
    color: "text-blue-500",
  },
  {
    title: "Find a Mentor",
    description: "Connect with experienced seniors",
    icon: UserPlus,
    href: "/dashboard/mentor",
    color: "text-green-500",
  },
  {
    title: "Build a Team",
    description: "Form the perfect hackathon team",
    icon: Users,
    href: "/dashboard/team-builder",
    color: "text-purple-500",
  },
  {
    title: "Doubt Solver",
    description: "Get AI-powered answers instantly",
    icon: MessageCircleQuestion,
    href: "/dashboard/doubt-solver",
    color: "text-orange-500",
  },
  {
    title: "Department Hub",
    description: "Access notes, forums, and resources",
    icon: BookOpen,
    href: "/dashboard/department-hub",
    color: "text-indigo-500",
  },
  {
    title: "Clubs & Societies",
    description: "Discover and join campus clubs",
    icon: Trophy,
    href: "/dashboard/clubs",
    color: "text-yellow-500",
  },
  {
    title: "Research Hub",
    description: "Collaborate on research projects",
    icon: FlaskConical,
    href: "/dashboard/research",
    color: "text-pink-500",
  },
  {
    title: "Leaderboard",
    description: "View rankings and earn rewards",
    icon: Award,
    href: "/dashboard/leaderboard",
    color: "text-red-500",
  },
];

const Overview = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (!profileData) {
      navigate("/profile");
      return;
    }

    setProfile(profileData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome back, {profile?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {profile?.department} • Year {profile?.year}
        </p>
      </div>

      <Card className="border-primary/20 shadow-glow">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access all UniBridge features from here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.href}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/40"
                onClick={() => navigate(action.href)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <action.icon className={`h-10 w-10 ${action.color}`} />
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP Points</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rank</span>
                <span className="font-semibold">Beginner</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Badges</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mentors</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Teams</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Clubs</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity yet. Start exploring features!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
