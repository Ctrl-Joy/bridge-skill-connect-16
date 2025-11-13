import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skills, profileId } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw new Error("Skills array is required");
    }

    if (!profileId) {
      throw new Error("Profile ID is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Generate embeddings for each skill using Lovable AI
    const skillEmbeddings = await Promise.all(
      skills.map(async (skill) => {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: skill,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Embedding API error:", response.status, errorText);
          throw new Error(`Failed to generate embedding for skill: ${skill}`);
        }

        const data = await response.json();
        return {
          skill,
          embedding: data.data[0].embedding,
        };
      })
    );

    // Delete existing skills for this profile
    const { error: deleteError } = await supabaseClient
      .from("skills")
      .delete()
      .eq("profile_id", profileId);

    if (deleteError) {
      console.error("Error deleting existing skills:", deleteError);
      throw deleteError;
    }

    // Insert new skills with embeddings
    const skillInserts = skillEmbeddings.map((se) => ({
      profile_id: profileId,
      skill_name: se.skill,
      embedding: se.embedding,
    }));

    const { error: insertError } = await supabaseClient
      .from("skills")
      .insert(skillInserts);

    if (insertError) {
      console.error("Error inserting skills:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated embeddings for ${skills.length} skills`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in extract-skills function:", error);
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
