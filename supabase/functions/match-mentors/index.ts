import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId } = await req.json();

    if (!profileId) {
      throw new Error("Profile ID is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get current user's profile and skills
    const { data: currentProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError) {
      console.error("Error fetching current profile:", profileError);
      throw profileError;
    }

    // Get current user's skill embeddings
    const { data: currentSkills, error: currentSkillsError } = await supabaseClient
      .from("skills")
      .select("embedding")
      .eq("profile_id", profileId);

    if (currentSkillsError) {
      console.error("Error fetching current skills:", currentSkillsError);
      throw currentSkillsError;
    }

    if (!currentSkills || currentSkills.length === 0) {
      return new Response(
        JSON.stringify({
          mentors: [],
          message: "Please add skills to your profile first",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate average embedding for current user
    const currentEmbedding = currentSkills[0].embedding as number[];

    // Get all potential mentors (students with higher year)
    const { data: potentialMentors, error: mentorsError } = await supabaseClient
      .from("profiles")
      .select("id, name, department, year, bio")
      .gt("year", currentProfile.year);

    if (mentorsError) {
      console.error("Error fetching potential mentors:", mentorsError);
      throw mentorsError;
    }

    if (!potentialMentors || potentialMentors.length === 0) {
      return new Response(
        JSON.stringify({
          mentors: [],
          message: "No senior students found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate similarity for each potential mentor
    const mentorMatches = await Promise.all(
      potentialMentors.map(async (mentor) => {
        // Get mentor's skills
        const { data: mentorSkills } = await supabaseClient
          .from("skills")
          .select("skill_name, embedding")
          .eq("profile_id", mentor.id);

        if (!mentorSkills || mentorSkills.length === 0) {
          return null;
        }

        // Calculate average similarity
        const mentorEmbedding = mentorSkills[0].embedding as number[];
        const similarity = cosineSimilarity(currentEmbedding, mentorEmbedding);

        return {
          id: mentor.id,
          name: mentor.name,
          department: mentor.department,
          year: mentor.year,
          bio: mentor.bio,
          skills: mentorSkills.map((s) => s.skill_name),
          similarity,
        };
      })
    );

    // Filter out null matches and sort by similarity
    const validMatches = mentorMatches
      .filter((m) => m !== null)
      .sort((a, b) => b!.similarity - a!.similarity)
      .slice(0, 5); // Top 5 matches

    return new Response(
      JSON.stringify({
        mentors: validMatches,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in match-mentors function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
