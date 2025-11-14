import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lightbulb, X, Users, Star, ArrowLeft } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  department: string;
  year: number;
  skills: string[];
  matchScore: number;
}

const TeamBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamSize, setTeamSize] = useState("3");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamName, setTeamName] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleBuildTeam = async () => {
    if (requiredSkills.length === 0) {
      toast.error("Please add at least one required skill");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("build-team", {
        body: {
          requiredSkills,
          teamSize: parseInt(teamSize),
          userId: session.user.id,
        },
      });

      if (error) throw error;

      setTeam(data.team || []);
      
      if (data.team && data.team.length > 0) {
        toast.success("Team built successfully!");
      } else {
        toast.error("No suitable team members found");
      }
    } catch (error: any) {
      toast.error(error.message || "Error building team");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    if (team.length === 0) {
      toast.error("No team to save");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamName,
          required_skills: requiredSkills,
          team_size: parseInt(teamSize),
          created_by: session.user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add team members
      const memberInserts = team.map((member) => ({
        team_id: teamData.id,
        profile_id: member.id,
        match_score: member.matchScore,
      }));

      const { error: membersError } = await supabase
        .from("team_members")
        .insert(memberInserts);

      if (membersError) throw membersError;

      toast.success("Team saved successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Error saving team");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Hackathon Team Builder</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Team Requirements</CardTitle>
              <CardDescription>
                Define your team needs and let AI find the best matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a required skill"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Team Size</Label>
                <Select value={teamSize} onValueChange={setTeamSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 members</SelectItem>
                    <SelectItem value="4">4 members</SelectItem>
                    <SelectItem value="5">5 members</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleBuildTeam}
                disabled={loading || requiredSkills.length === 0}
              >
                {loading ? "Building Team..." : "Build Team"}
              </Button>
            </CardContent>
          </Card>

          {/* Team Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Your Team</CardTitle>
              <CardDescription>
                {team.length > 0
                  ? `${team.length} team members selected`
                  : "Configure requirements and build your team"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {team.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 rounded-lg border bg-gradient-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {member.department} • Year {member.year}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10">
                            <Star className="h-3 w-3 text-accent fill-accent" />
                            <span className="text-xs font-semibold text-accent">
                              {Math.round(member.matchScore * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{member.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label>Team Name</Label>
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter a name for your team"
                    />
                  </div>

                  <Button className="w-full" onClick={handleSaveTeam}>
                    Save Team
                  </Button>
                </>
              ) : (
                <div className="py-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No team built yet. Configure your requirements and click "Build Team"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamBuilder;
