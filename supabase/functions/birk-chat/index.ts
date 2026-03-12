import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = lang === "da"
      ? `Du er Birks venlige restaurantassistent. Birk er en nordisk gourmetrestaurant beliggende på Skovvej 14, 2100 København Ø. Åbent tirsdag-lørdag 18:00-22:30. Telefon: +45 32 10 20 30. Email: bord@birk.dk.

Menuen inkluderer:
FORRETTER: Røget laks & rugbrød (145 kr), Stenbiderrogn (175 kr), Brændt selleri (125 kr), Syltet grønkål (115 kr)
HOVEDRETTER: Pighvar fra Nordsøen (345 kr), Hjortekølle (365 kr), Grillet Bornholmerlam (325 kr), Ørred & havtorn (285 kr)
DESSERTER: Skyr & havtorn (115 kr), Karameliseret æble (125 kr), Rugbrødsmousse (115 kr)

Hjælp gæster med: reservation, menuinformation, åbningstider, beliggenhed og generelle spørgsmål. Svar altid på dansk. Vær venlig, præcis og kortfattet.`
      : `You are Birk's friendly restaurant assistant. Birk is a Nordic gourmet restaurant located at Skovvej 14, 2100 Copenhagen. Open Tuesday-Saturday 6:00 PM-10:30 PM. Phone: +45 32 10 20 30. Email: bord@birk.dk.

Menu includes:
STARTERS: Smoked salmon & rye (145 DKK), Lumpfish roe (175 DKK), Charred celeriac (125 DKK), Pickled kale (115 DKK)
MAINS: North Sea turbot (345 DKK), Venison haunch (365 DKK), Grilled Bornholm lamb (325 DKK), Trout & sea buckthorn (285 DKK)
DESSERTS: Skyr & sea buckthorn (115 DKK), Caramelised apple (125 DKK), Rye bread mousse (115 DKK)

Help guests with: reservations, menu information, opening hours, location and general questions. Always respond in English. Be warm, concise and helpful.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Grænse for anmodninger nået. Prøv igen om lidt." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Betalingskrav. Kontakt venligst restauranten direkte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("birk-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
