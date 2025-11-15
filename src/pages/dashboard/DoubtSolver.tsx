import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleQuestion, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

const DoubtSolver = () => {
  const [doubt, setDoubt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!doubt.trim()) {
      toast.error("Please enter your doubt");
      return;
    }

    setLoading(true);
    // AI integration will be added here
    setTimeout(() => {
      setLoading(false);
      toast.success("AI is processing your doubt...");
    }, 1000);
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
          <p className="text-sm text-muted-foreground text-center py-8">
            No doubts asked yet. Start by asking your first question!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoubtSolver;
