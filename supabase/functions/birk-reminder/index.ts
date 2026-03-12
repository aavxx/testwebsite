import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing env vars" }), { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get bookings where reminder hasn't been sent and reservation is in ~24h
    const reservationTime = new Date("2026-02-25T18:30:00");
    const now = new Date();
    const hoursUntil = (reservationTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Only send if within 24-25 hours window
    if (hoursUntil < 23 || hoursUntil > 25) {
      return new Response(JSON.stringify({ message: "Not in reminder window", hoursUntil }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("reminder_sent", false);

    if (error) throw error;
    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ message: "No bookings to remind" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    for (const booking of bookings) {
      const da = booking.lang === "da";
      const html = `<!DOCTYPE html>
<html lang="${booking.lang || 'da'}">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f7f7f5;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;padding:48px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;">
        <tr>
          <td style="background:#1a1a1a;padding:36px 48px;text-align:center;">
            <p style="margin:0;font-size:28px;letter-spacing:0.3em;color:#fff;font-weight:700;">BIRK</p>
            <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.2em;color:rgba(255,255,255,0.5);text-transform:uppercase;">Maltvej 10 · 8400 Ebeltoft</p>
          </td>
        </tr>
        <tr>
          <td style="padding:48px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;color:#999;text-transform:uppercase;">${da ? "Påmindelse" : "Reminder"}</p>
            <h1 style="margin:0 0 24px;font-size:24px;color:#1a1a1a;font-weight:400;">
              ${da ? `Kære ${booking.name},` : `Dear ${booking.name},`}
            </h1>
            <p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.8;">
              ${da
                ? "Vi minder dig om din reservation hos Birk i morgen."
                : "We'd like to remind you of your reservation at Birk tomorrow."
              }
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;border-left:2px solid #1a1a1a;margin-bottom:32px;">
              <tr><td style="padding:24px 28px;">
                <table width="100%">
                  <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;width:40%;">${da ? "Dato" : "Date"}</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">25. februar 2026</td></tr>
                  <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;">${da ? "Tidspunkt" : "Time"}</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">18:30</td></tr>
                  <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;">${da ? "Gæster" : "Guests"}</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">${booking.guests}</td></tr>
                </table>
              </td></tr>
            </table>
            <p style="margin:0;font-size:14px;color:#555;">
              ${da ? "Vi ses snart," : "See you soon,"}<br />
              <strong style="color:#1a1a1a;">Restaurant Birk</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 48px;border-top:1px solid #e8e8e8;text-align:center;">
            <p style="margin:0;font-size:11px;color:#bbb;letter-spacing:0.1em;">BIRK · Maltvej 10 · 8400 Ebeltoft</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Birk Restaurant <noreply@restaurantbirk.dk>",
          to: [booking.email],
          subject: da ? "Påmindelse: Din reservation hos Birk i morgen" : "Reminder: Your reservation at Birk tomorrow",
          html,
        }),
      });

      if (res.ok) {
        await supabase.from("bookings").update({ reminder_sent: true }).eq("id", booking.id);
        sent++;
      } else {
        console.error("Failed to send reminder to", booking.email);
      }
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("birk-reminder error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
