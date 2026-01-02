import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("[OCR] Starting text extraction from document...");

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
            content: `You are an expert OCR system specialized in extracting information from Kenyan educational certificates, specifically KCSE (Kenya Certificate of Secondary Education) certificates and student IDs.

Extract ALL visible text from the document and parse it into structured data. Focus on:
1. Student Information: Full name, index number, date of birth, gender
2. Institution Details: School name, school code, county, sub-county
3. Academic Results: Subject grades, mean grade, mean points
4. Certificate Details: Year of examination, certificate number, serial number
5. Verification Elements: QR codes (if visible), official stamps, signatures, watermarks

Return the data as a JSON object with the following structure:
{
  "rawText": "All extracted text from the document",
  "structured": {
    "studentName": "Full name as shown",
    "indexNumber": "e.g., 123456789/2023",
    "dateOfBirth": "DD/MM/YYYY format",
    "gender": "Male/Female",
    "schoolName": "Name of school",
    "schoolCode": "School code if visible",
    "county": "County name",
    "yearOfExam": "2023",
    "certificateNumber": "If visible",
    "subjects": [
      { "name": "Mathematics", "grade": "A", "points": 12 }
    ],
    "meanGrade": "A",
    "meanPoints": "12.00",
    "totalPoints": 84
  },
  "verificationElements": {
    "hasWatermark": true/false,
    "hasQRCode": true/false,
    "hasOfficialStamp": true/false,
    "hasSignature": true/false,
    "stampText": "Any text from stamps"
  },
  "confidence": 0.95,
  "notes": "Any observations about document quality or potential issues"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text and information from this educational certificate. Parse it into the structured format specified. Be thorough in identifying all visible text, grades, names, and verification elements."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("[OCR] Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("[OCR] Payment required");
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("[OCR] AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI model");
    }

    console.log("[OCR] Raw AI response received");

    // Try to parse as JSON
    let parsedData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedData = JSON.parse(jsonStr);
      console.log("[OCR] Successfully parsed structured data");
    } catch (parseError) {
      console.log("[OCR] Could not parse as JSON, returning raw text");
      parsedData = {
        rawText: content,
        structured: null,
        verificationElements: null,
        confidence: 0.5,
        notes: "Could not parse structured data from response"
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[OCR] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
