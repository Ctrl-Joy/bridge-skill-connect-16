import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, MessageSquare, Users } from "lucide-react";

const DepartmentHub = () => {
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartment();
  }, []);

  const loadDepartment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("department")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      setDepartment(profileData.department);
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
          <BookOpen className="h-8 w-8 text-primary" />
          Department Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          {department} - Access notes, forums, and academic resources
        </p>
      </div>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="forums">Forums</TabsTrigger>
          <TabsTrigger value="exam">Exam Prep</TabsTrigger>
          <TabsTrigger value="mentors">Micro-Mentors</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Study Notes
              </CardTitle>
              <CardDescription>
                Shared notes and materials from your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No notes available yet. Be the first to contribute!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forums">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discussion Forums
              </CardTitle>
              <CardDescription>
                Ask questions and discuss topics with your peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No discussions yet. Start a new thread!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exam">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Exam Preparation
              </CardTitle>
              <CardDescription>
                Previous papers, study guides, and preparation tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Exam preparation resources coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Micro-Mentors
              </CardTitle>
              <CardDescription>
                Connect with subject-specific mentors in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Micro-mentorship program launching soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepartmentHub;
