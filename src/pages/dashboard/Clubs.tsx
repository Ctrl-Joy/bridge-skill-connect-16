import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Club {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface ClubWithMembers extends Club {
  memberCount: number;
  isMember: boolean;
}

const Clubs = () => {
  const [clubs, setClubs] = useState<ClubWithMembers[]>([]);
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      setProfileId(profileData.id);
      await loadClubs(profileData.id);
    }
    setLoading(false);
  };

  const loadClubs = async (profId: string) => {
    const { data: clubsData } = await supabase
      .from("clubs")
      .select("*");

    if (clubsData) {
      const clubsWithMembers = await Promise.all(
        clubsData.map(async (club) => {
          const { count } = await supabase
            .from("club_members")
            .select("*", { count: "exact", head: true })
            .eq("club_id", club.id);

          const { data: memberData } = await supabase
            .from("club_members")
            .select("id")
            .eq("club_id", club.id)
            .eq("profile_id", profId)
            .maybeSingle();

          return {
            ...club,
            memberCount: count || 0,
            isMember: !!memberData,
          };
        })
      );

      setClubs(clubsWithMembers);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      await supabase.from("club_members").insert({
        club_id: clubId,
        profile_id: profileId,
      });

      toast.success("Joined club!");
      loadClubs(profileId);
    } catch (error: any) {
      toast.error("Failed to join club");
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    try {
      await supabase
        .from("club_members")
        .delete()
        .eq("club_id", clubId)
        .eq("profile_id", profileId);

      toast.success("Left club");
      loadClubs(profileId);
    } catch (error: any) {
      toast.error("Failed to leave club");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const myClubs = clubs.filter((c) => c.isMember);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Clubs & Societies
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover clubs and get matched based on your skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{clubs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{myClubs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recommended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{clubs.length - myClubs.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            All Clubs
          </CardTitle>
          <CardDescription>
            Join clubs that match your interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <Card key={club.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{club.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {club.category}
                      </Badge>
                    </div>

                    {club.description && (
                      <p className="text-sm text-muted-foreground">{club.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{club.memberCount} members</span>
                    </div>

                    {club.isMember ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleLeaveClub(club.id)}
                      >
                        Leave Club
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleJoinClub(club.id)}
                      >
                        Join Club
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clubs;
