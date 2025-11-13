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
    const { requiredSkills, teamSize, userId } = await req.json();

    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      throw new Error("Required skills array is required");
    }

    if (!teamSize || teamSize < 3 || teamSize > 5) {
      throw new Error("Team size must be between 3 and 5");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Generate embedding for required skills
    const skillsText = requiredSkills.join(", ");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: skillsText,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Embedding API error:", response.status, errorText);
      throw new Error("Failed to generate embedding for required skills");
    }

    const embeddingData = await response.json();
    const requiredEmbedding = embeddingData.data[0].embedding;

    // Get all student profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("id, name, department, year");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({
          team: [],
          message: "No students found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate match score for each student
    const candidates = await Promise.all(
      profiles.map(async (profile) => {
        // Get student's skills
        const { data: studentSkills } = await supabaseClient
          .from("skills")
          .select("skill_name, embedding")
          .eq("profile_id", profile.id);

        if (!studentSkills || studentSkills.length === 0) {
          return null;
        }

        // Calculate average similarity with required skills
        const studentEmbedding = studentSkills[0].embedding as number[];
        const matchScore = cosineSimilarity(requiredEmbedding, studentEmbedding);

        return {
          id: profile.id,
          name: profile.name,
          department: profile.department,
          year: profile.year,
          skills: studentSkills.map((s) => s.skill_name),
          matchScore,
        };
      })
    );

    // Filter valid candidates and sort by match score
    const validCandidates = candidates
      .filter((c) => c !== null)
      .sort((a, b) => b!.matchScore - a!.matchScore);

    // Build team using greedy algorithm
    const team: any[] = [];
    const usedSkills = new Set<string>();

    for (const candidate of validCandidates) {
      if (team.length >= teamSize) break;

      // Check if candidate adds new skills
      const newSkills = candidate!.skills.filter((s) => !usedSkills.has(s));
      
      if (newSkills.length > 0 || team.length === 0) {
        team.push(candidate);
        candidate!.skills.forEach((s: string) => usedSkills.add(s));
      }
    }

    // If we don't have enough team members, add top candidates
    while (team.length < teamSize && team.length < validCandidates.length) {
      const nextCandidate = validCandidates.find(
        (c) => !team.some((t) => t.id === c!.id)
      );
      if (nextCandidate) {
        team.push(nextCandidate);
      } else {
        break;
      }
    }

    return new Response(
      JSON.stringify({
        team,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in build-team function:", error);
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
