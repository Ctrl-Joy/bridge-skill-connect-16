import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircleQuestion, Send, Sparkles, User, Clock } from "lucide-react";
import { toast } from "sonner";

interface Mentor {
  id: string;
  name: string;
  department: string;
  year: number;
}

interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: string;
  ai_response: string | null;
  created_at: string;
}

const DoubtSolver = () => {
  const [title, setTitle] = useState("");
  const [doubt, setDoubt] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [suggestedMentors, setSuggestedMentors] = useState<Mentor[]>([]);
  const [recentDoubts, setRecentDoubts] = useState<Doubt[]>([]);
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    loadProfile();
    loadRecentDoubts();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      setProfileId(profileData.id);
    }
  };

  const loadRecentDoubts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      const { data: doubtsData } = await supabase
        .from("doubts")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentDoubts(doubtsData || []);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !doubt.trim() || !subject.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!profileId) {
      toast.error("Profile not loaded. Please refresh.");
      return;
    }

    setLoading(true);
    setAiResponse("");
    setSuggestedMentors([]);

    try {
      const { data: doubtData, error: doubtError } = await supabase
        .from("doubts")
        .insert({
          profile_id: profileId,
          title,
          description: doubt,
          subject,
        })
        .select()
        .single();

      if (doubtError) throw doubtError;

      const { data, error } = await supabase.functions.invoke("ai-doubt-solver", {
        body: {
          doubtId: doubtData.id,
          doubtText: doubt,
          subject,
        },
      });

      if (error) throw error;

      setAiResponse(data.aiResponse);
      setSuggestedMentors(data.suggestedMentors || []);
      toast.success("AI response generated!");
      loadRecentDoubts();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to get AI response");
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
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief title for your doubt"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                  <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doubt">Description</Label>
              <Textarea
                id="doubt"
                placeholder="Example: I'm struggling to understand recursion in data structures..."
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Get AI Answer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {aiResponse && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground">{aiResponse}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {suggestedMentors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Mentors</CardTitle>
            <CardDescription>
              Seniors who can help with your doubt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestedMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {mentor.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{mentor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {mentor.department} • Year {mentor.year}
                      </p>
                    </div>
                  </div>
                  <Button size="sm">Connect</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Doubts</CardTitle>
          <CardDescription>
            Your previously asked questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentDoubts.length > 0 ? (
            <div className="space-y-3">
              {recentDoubts.map((d) => (
                <div key={d.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{d.title}</h4>
                    <Badge variant="secondary">{d.subject}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {d.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(d.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No doubts asked yet. Start by asking your first question!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoubtSolver;
