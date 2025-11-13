import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, Lightbulb, User, LogOut, GraduationCap } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  department: string;
  year: number;
  bio?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!profileData) {
        // No profile exists, redirect to profile creation
        navigate("/profile");
      } else {
        setProfile(profileData);
      }
    } catch (error: any) {
      toast.error("Error loading profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">UniBridge</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {profile?.name || "User"}! 👋
          </h2>
          <p className="text-lg text-muted-foreground">
            {profile?.department} • Year {profile?.year}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary" onClick={() => navigate("/mentor")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Find a Mentor</CardTitle>
              <CardDescription>
                Connect with senior students who can guide your learning journey
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-accent" onClick={() => navigate("/team-builder")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lightbulb className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Build a Team</CardTitle>
              <CardDescription>
                Create optimal hackathon teams with AI-powered matching
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary-light" onClick={() => navigate("/profile")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary-light/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-primary-light" />
              </div>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your skills, bio, and other profile information
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Profile Summary */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Your Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Bio</h3>
                <p className="text-muted-foreground">
                  {profile.bio || "No bio added yet. Click Edit Profile to add one!"}
                </p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => navigate("/profile")}>Edit Profile</Button>
                <Button variant="outline" onClick={() => navigate("/mentor")}>
                  Find Mentors
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
