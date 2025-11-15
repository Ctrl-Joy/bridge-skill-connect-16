import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillGraphVisualization } from "@/components/SkillGraphVisualization";
import { Network, TrendingUp } from "lucide-react";

interface Skill {
  skill_name: string;
}

const SkillGraph = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      const { data: skillsData } = await supabase
        .from("skills")
        .select("skill_name")
        .eq("profile_id", profileData.id);

      setSkills(skillsData || []);
    }
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
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Network className="h-8 w-8 text-primary" />
          AI Skill Graph
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize your skills and discover connections across the university
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Skill Network</CardTitle>
            <CardDescription>
              Skills extracted from your profile and resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-base py-2 px-4">
                    {skill.skill_name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No skills found. Add skills to your profile to see your skill graph.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Trending Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">React</span>
                <Badge variant="outline">+45%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Machine Learning</span>
                <Badge variant="outline">+38%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Python</span>
                <Badge variant="outline">+32%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Science</span>
                <Badge variant="outline">+28%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Connections</CardTitle>
          <CardDescription>
            Interactive visualization of your skill network
          </CardDescription>
        </CardHeader>
        <CardContent>
          {skills.length > 0 ? (
            <SkillGraphVisualization skills={skills.map(s => s.skill_name)} />
          ) : (
            <div className="text-center py-12">
              <Network className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Add skills to your profile to see the visualization
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillGraph;
