import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, MessageSquare, Users, Plus, Clock, User } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  created_at: string;
  profiles: { name: string };
}

interface ForumPost {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  profiles: { name: string };
}

const DepartmentHub = () => {
  const [department, setDepartment] = useState("");
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [forumId, setForumId] = useState("");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  useEffect(() => {
    loadDepartment();
  }, []);

  useEffect(() => {
    if (department && profileId) {
      loadNotes();
      loadForum();
    }
  }, [department, profileId]);

  const loadDepartment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, department")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      setDepartment(profileData.department);
      setProfileId(profileData.id);
    }
    setLoading(false);
  };

  const loadNotes = async () => {
    const { data } = await supabase
      .from("notes")
      .select("*, profiles(name)")
      .eq("department", department)
      .order("created_at", { ascending: false });

    setNotes(data || []);
  };

  const loadForum = async () => {
    let { data: forumData } = await supabase
      .from("forums")
      .select("id")
      .eq("department", department)
      .maybeSingle();

    if (!forumData) {
      const { data: newForum } = await supabase
        .from("forums")
        .insert({ name: `${department} Forum`, department })
        .select()
        .single();
      forumData = newForum;
    }

    if (forumData) {
      setForumId(forumData.id);

      const { data: postsData } = await supabase
        .from("forum_posts")
        .select("*, profiles(name)")
        .eq("forum_id", forumData.id)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      setForumPosts(postsData || []);
    }
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim() || !noteSubject.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await supabase.from("notes").insert({
        profile_id: profileId,
        title: noteTitle,
        description: noteDesc,
        subject: noteSubject,
        department,
      });

      toast.success("Note created!");
      setNoteDialogOpen(false);
      setNoteTitle("");
      setNoteDesc("");
      setNoteSubject("");
      loadNotes();
    } catch (error: any) {
      toast.error("Failed to create note");
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await supabase.from("forum_posts").insert({
        forum_id: forumId,
        profile_id: profileId,
        title: postTitle,
        content: postContent,
      });

      toast.success("Post created!");
      setPostDialogOpen(false);
      setPostTitle("");
      setPostContent("");
      loadForum();
    } catch (error: any) {
      toast.error("Failed to create post");
    }
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Study Notes
                </CardTitle>
                <CardDescription>
                  Shared notes and materials from your department
                </CardDescription>
              </div>
              <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                    <DialogDescription>
                      Share your study notes with the department
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="noteTitle">Title</Label>
                      <Input
                        id="noteTitle"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Linear Algebra Notes - Chapter 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noteSubject">Subject</Label>
                      <Input
                        id="noteSubject"
                        value={noteSubject}
                        onChange={(e) => setNoteSubject(e.target.value)}
                        placeholder="Mathematics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noteDesc">Description</Label>
                      <Textarea
                        id="noteDesc"
                        value={noteDesc}
                        onChange={(e) => setNoteDesc(e.target.value)}
                        placeholder="Brief description of the notes..."
                      />
                    </div>
                    <Button onClick={handleCreateNote} className="w-full">
                      Create Note
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold">{note.title}</h4>
                            <Badge variant="secondary">{note.subject}</Badge>
                          </div>
                          {note.description && (
                            <p className="text-sm text-muted-foreground">{note.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {note.profiles.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(note.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No notes available yet. Be the first to contribute!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forums">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Discussion Forums
                </CardTitle>
                <CardDescription>
                  Ask questions and discuss topics with your peers
                </CardDescription>
              </div>
              <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Thread
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Thread</DialogTitle>
                    <DialogDescription>
                      Start a discussion in your department forum
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="postTitle">Title</Label>
                      <Input
                        id="postTitle"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Need help with assignment 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postContent">Content</Label>
                      <Textarea
                        id="postContent"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Describe your question or topic..."
                        rows={5}
                      />
                    </div>
                    <Button onClick={handleCreatePost} className="w-full">
                      Create Thread
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {forumPosts.length > 0 ? (
                <div className="space-y-4">
                  {forumPosts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          {post.title && (
                            <h4 className="font-semibold">{post.title}</h4>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.profiles.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No discussions yet. Start a new thread!
                  </p>
                </div>
              )}
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
