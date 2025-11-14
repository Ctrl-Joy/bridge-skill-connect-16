import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Sparkles, ArrowLeft, GraduationCap } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  department: z.string().trim().min(2, "Department must be at least 2 characters").max(100, "Department must be less than 100 characters"),
  year: z.number().int().min(1, "Year must be at least 1").max(6, "Year must be at most 6"),
  bio: z.string().trim().max(1000, "Bio must be less than 1000 characters").optional(),
});

const skillSchema = z.string().trim().min(2, "Skill must be at least 2 characters").max(50, "Skill must be less than 50 characters");

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [profileId, setProfileId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "1",
    bio: "",
  });
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (profileData) {
        setProfileId(profileData.id);
        setFormData({
          name: profileData.name || "",
          department: profileData.department || "",
          year: profileData.year?.toString() || "1",
          bio: profileData.bio || "",
        });

        // Load skills
        const { data: skillsData } = await supabase
          .from("skills")
          .select("skill_name")
          .eq("profile_id", profileData.id);

        if (skillsData) {
          setSkills(skillsData.map((s) => s.skill_name));
        }
      }
    } catch (error: any) {
      toast.error("Error loading profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    
    // Validate skill
    const validationResult = skillSchema.safeParse(trimmedSkill);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    if (!skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput("");
    } else {
      toast.error("Skill already added");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleGenerateEmbeddings = async () => {
    if (skills.length === 0) {
      toast.error("Please add some skills first");
      return;
    }

    if (!profileId) {
      toast.error("Please save your profile first");
      return;
    }

    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-skills", {
        body: { skills, profileId },
      });

      if (error) throw error;

      toast.success("Skills analyzed and embeddings generated!");
    } catch (error: any) {
      toast.error(error.message || "Error generating embeddings");
      console.error(error);
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    // Validate form data
    const validationResult = profileSchema.safeParse({
      name: formData.name.trim(),
      department: formData.department.trim(),
      year: parseInt(formData.year),
      bio: formData.bio.trim() || undefined,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setSaving(true);
    try {
      if (profileId) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            name: validationResult.data.name,
            department: validationResult.data.department,
            year: validationResult.data.year,
            bio: validationResult.data.bio || null,
          })
          .eq("id", profileId);

        if (error) throw error;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            name: validationResult.data.name,
            department: validationResult.data.department,
            year: validationResult.data.year,
            bio: validationResult.data.bio || null,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setProfileId(data.id);
        }
      }

      toast.success("Profile saved successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error saving profile");
      console.error(error);
    } finally {
      setSaving(false);
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Complete your profile to get better mentor and team matches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                  <SelectItem value="5">5th Year</SelectItem>
                  <SelectItem value="6">6th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself, your interests, and goals..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., Python, Machine Learning)"
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
                {skills.map((skill) => (
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

            {skills.length > 0 && profileId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateEmbeddings}
                disabled={extracting}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {extracting ? "Generating..." : "Generate Skill Embeddings"}
              </Button>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
