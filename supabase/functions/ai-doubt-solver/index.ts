import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { doubtId, doubtText, subject } = await req.json();

    if (!doubtText || !subject) {
      throw new Error("Doubt text and subject are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Generate AI response using Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert tutor helping university students with their doubts. Subject: ${subject}. Provide clear, concise explanations with examples when helpful. Break down complex concepts into simpler terms.`
          },
          {
            role: "user",
            content: doubtText
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Failed to generate AI response");
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;

    // Generate embedding for doubt to find similar mentors
    const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: doubtText,
      }),
    });

    if (!embeddingResponse.ok) {
      console.error("Embedding API error");
    }

    const embeddingData = await embeddingResponse.json();
    const doubtEmbedding = embeddingData.data[0].embedding;

    // Find mentors with similar skills
    const { data: allSkills } = await supabaseClient
      .from("skills")
      .select("profile_id, skill_name, embedding");

    let suggestedMentors = [];
    if (allSkills && allSkills.length > 0) {
      // Calculate cosine similarity
      const similarities = allSkills.map((skill: any) => {
        const embedding = skill.embedding as number[];
        const dotProduct = doubtEmbedding.reduce((sum: number, val: number, i: number) => sum + val * embedding[i], 0);
        const normA = Math.sqrt(doubtEmbedding.reduce((sum: number, val: number) => sum + val * val, 0));
        const normB = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0));
        return {
          profileId: skill.profile_id,
          similarity: dotProduct / (normA * normB),
        };
      });

      // Get top 3 unique profiles
      const uniqueProfiles = new Map();
      similarities
        .sort((a, b) => b.similarity - a.similarity)
        .forEach((s) => {
          if (!uniqueProfiles.has(s.profileId) && uniqueProfiles.size < 3) {
            uniqueProfiles.set(s.profileId, s.similarity);
          }
        });

      // Fetch mentor details
      const mentorIds = Array.from(uniqueProfiles.keys());
      const { data: mentorProfiles } = await supabaseClient
        .from("profiles")
        .select("id, name, department, year")
        .in("id", mentorIds);

      suggestedMentors = mentorProfiles || [];
    }

    // Update doubt with AI response if doubtId provided
    if (doubtId) {
      await supabaseClient
        .from("doubts")
        .update({ ai_response: aiResponse, status: "answered" })
        .eq("id", doubtId);
    }

    return new Response(
      JSON.stringify({
        aiResponse,
        suggestedMentors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-doubt-solver function:", error);
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