import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentImage, selfieImage, documentData } = await req.json();

    if (!documentImage || !selfieImage) {
      throw new Error('Both document image and selfie are required');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("[BIOMETRIC] Starting facial comparison...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert biometric verification system for identity document authentication. Your task is to compare a face from an ID document/certificate with a live selfie to verify identity.

Analyze both images and provide:
1. Face Match Analysis: Compare facial features, bone structure, and unique identifiers
2. Match Confidence: Percentage score (0-100) for how likely the faces belong to the same person
3. Key Matching Features: List specific features that match or differ
4. Potential Concerns: Flag any issues like image quality, angle differences, or possible fraud indicators
5. Liveness Assessment: Evaluate if the selfie appears to be from a live person (not a photo of a photo)

Return as JSON:
{
  "matchScore": 0-100,
  "matchVerdict": "MATCH" | "PARTIAL_MATCH" | "NO_MATCH" | "INCONCLUSIVE",
  "matchingFeatures": ["feature1", "feature2"],
  "differingFeatures": ["feature1", "feature2"],
  "documentName": "Name extracted from document if visible",
  "livenessConfidence": 0-100,
  "livenessIndicators": {
    "naturalLighting": true/false,
    "depthCues": true/false,
    "skinTexture": true/false,
    "eyeReflection": true/false
  },
  "concerns": ["concern1", "concern2"],
  "recommendation": "APPROVE" | "MANUAL_REVIEW" | "REJECT",
  "notes": "Additional observations"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Compare these two images for identity verification.

Image 1: ID Document/Certificate photo
Image 2: Live selfie capture

${documentData?.studentName ? `Expected name from OCR: ${documentData.studentName}` : ''}

Perform facial comparison and liveness assessment. Return structured JSON analysis.`
              },
              {
                type: "image_url",
                image_url: {
                  url: documentImage.startsWith('data:') ? documentImage : `data:image/jpeg;base64,${documentImage}`
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: selfieImage.startsWith('data:') ? selfieImage : `data:image/jpeg;base64,${selfieImage}`
                }
              }
            ]
          }
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI model");
    }

    console.log("[BIOMETRIC] AI response received");

    let parsedResult;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedResult = JSON.parse(jsonStr);
    } catch {
      console.log("[BIOMETRIC] Could not parse JSON, using defaults");
      parsedResult = {
        matchScore: 50,
        matchVerdict: "INCONCLUSIVE",
        matchingFeatures: [],
        differingFeatures: [],
        livenessConfidence: 70,
        concerns: ["Could not perform detailed analysis"],
        recommendation: "MANUAL_REVIEW",
        notes: content
      };
    }

    console.log("[BIOMETRIC] Match score:", parsedResult.matchScore);

    return new Response(
      JSON.stringify({ success: true, data: parsedResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[BIOMETRIC] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
