import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleQuestion, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Doubt {
  id: string;
  question: string;
  created_at: string;
  status: string;
}

const DoubtSolver = () => {
  const [doubt, setDoubt] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<string>("");
  const [recentDoubts, setRecentDoubts] = useState<Doubt[]>([]);

  useEffect(() => {
    loadProfile();
    loadDoubts();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (profile) setProfileId(profile.id);
  };

  const loadDoubts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) return;

    const { data, error } = await supabase
      .from("doubts")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error loading doubts:", error);
      return;
    }

    setRecentDoubts(data || []);
  };

  const handleSubmit = async () => {
    if (!doubt.trim()) {
      toast.error("Please enter your doubt");
      return;
    }

    if (!profileId) {
      toast.error("Please complete your profile first");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("doubts")
        .insert({
          profile_id: profileId,
          question: doubt.trim(),
          status: "open",
        });

      if (error) throw error;

      toast.success("Doubt submitted successfully!");
      setDoubt("");
      loadDoubts();
    } catch (error: any) {
      toast.error(error.message || "Error submitting doubt");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageCircleQuestion className="h-8 w-8 text-primary" />
          AI Doubt Solver & Study Buddy
        </h1>
        <p className="text-muted-foreground mt-2">
          Get instant AI-powered answers and connect with seniors who can help
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ask Your Doubt
          </CardTitle>
          <CardDescription>
            Describe your question or problem and get AI-powered solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Example: I'm struggling to understand recursion in data structures..."
              value={doubt}
              onChange={(e) => setDoubt(e.target.value)}
              className="min-h-[200px]"
            />
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Get AI Answer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Suggested Mentors</CardTitle>
            <CardDescription>
              Seniors who can help with your doubt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Submit a doubt to see suggested mentors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Resources</CardTitle>
            <CardDescription>
              Helpful materials and links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Submit a doubt to see related resources
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Doubts</CardTitle>
          <CardDescription>
            Your previously asked questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentDoubts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No doubts asked yet. Start by asking your first question!
            </p>
          ) : (
            <div className="space-y-3">
              {recentDoubts.map((d) => (
                <div key={d.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium line-clamp-2">{d.question}</p>
                    <Badge variant={d.status === "open" ? "default" : "secondary"}>
                      {d.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoubtSolver;
