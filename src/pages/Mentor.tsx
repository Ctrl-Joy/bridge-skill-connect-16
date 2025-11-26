import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Star, Users } from "lucide-react";

interface MentorMatch {
  id: string;
  name: string;
  department: string;
  year: number;
  bio?: string;
  skills: string[];
  similarity: number;
}

const Mentor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<MentorMatch[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      // Get current user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        toast.error("Please complete your profile first");
        navigate("/profile");
        return;
      }

      setCurrentProfile(profile);

      // Call mentor matching function
      const { data, error } = await supabase.functions.invoke("match-mentors", {
        body: { profileId: profile.id },
      });

      if (error) throw error;

      if (data?.message) {
        toast.info(data.message);
      }

      setMentors(data?.mentors || []);
    } catch (error: any) {
      toast.error("Error loading mentors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async (mentorId: string) => {
    try {
      const { error } = await supabase.from("mentorships").insert({
        mentor_id: mentorId,
        mentee_id: currentProfile.id,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You've already requested this mentor");
        } else {
          throw error;
        }
      } else {
        toast.success("Mentorship request sent!");
      }
    } catch (error: any) {
      toast.error("Error sending request");
      console.error(error);
    }
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
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Top Mentor Matches
          </h2>
          <p className="text-muted-foreground">
            AI-powered recommendations based on your skills and goals
          </p>
        </div>

        {mentors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
              <p className="text-muted-foreground mb-6">
                Add skills to your profile and generate embeddings to find mentor matches
              </p>
              <Button onClick={() => navigate("/profile")}>Add Skills to Profile</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-background font-bold text-lg">
                      {mentor.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="text-sm font-semibold text-accent">
                        {Math.round(mentor.similarity * 100)}%
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{mentor.name}</CardTitle>
                  <CardDescription>
                    {mentor.department} • Year {mentor.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mentor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}
                  
                  {mentor.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-foreground">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {mentor.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {mentor.skills.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{mentor.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleRequestMentorship(mentor.id)}
                  >
                    Request Mentorship
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentor;
