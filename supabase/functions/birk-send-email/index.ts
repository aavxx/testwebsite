import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, email, phone, guests, note, lang } = await req.json();

    const da = lang === "da";
    const dateStr = "25. februar 2026";
    const timeStr = "18:30";
    const restaurantEmail = "restaurantbirk@outlook.dk";
    const restaurantName = "Restaurant Birk";

    // ─── Guest confirmation email ───────────────────────────────────────────
    const guestSubject = da
      ? `Bordbekræftelse – ${restaurantName}`
      : `Reservation Confirmation – ${restaurantName}`;

    const guestHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${guestSubject}</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f5;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;padding:48px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:36px 48px;text-align:center;">
            <p style="margin:0;font-family:'Georgia',serif;font-size:28px;letter-spacing:0.3em;color:#ffffff;font-weight:700;">BIRK</p>
            <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.2em;color:rgba(255,255,255,0.5);text-transform:uppercase;">Maltvej 10 · 8400 Ebeltoft</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:48px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;color:#999;text-transform:uppercase;">${da ? "Bekræftelse" : "Confirmation"}</p>
            <h1 style="margin:0 0 32px;font-size:26px;color:#1a1a1a;font-weight:400;line-height:1.3;">
              ${da ? `Kære ${name},` : `Dear ${name},`}
            </h1>
            <p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.8;">
              ${da
                ? `Vi glæder os til at byde dig velkommen til Birk. Din reservation er bekræftet med følgende detaljer:`
                : `We look forward to welcoming you to Birk. Your reservation has been confirmed with the following details:`
              }
            </p>
            <!-- Details box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;border-left:2px solid #1a1a1a;margin-bottom:32px;">
              <tr><td style="padding:24px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:11px;letter-spacing:0.15em;color:#999;text-transform:uppercase;width:40%;">${da ? "Dato" : "Date"}</td>
                    <td style="padding:6px 0;font-size:14px;color:#1a1a1a;">${dateStr}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:11px;letter-spacing:0.15em;color:#999;text-transform:uppercase;">${da ? "Tidspunkt" : "Time"}</td>
                    <td style="padding:6px 0;font-size:14px;color:#1a1a1a;">${timeStr}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:11px;letter-spacing:0.15em;color:#999;text-transform:uppercase;">${da ? "Gæster" : "Guests"}</td>
                    <td style="padding:6px 0;font-size:14px;color:#1a1a1a;">${guests}</td>
                  </tr>
                  ${phone ? `<tr>
                    <td style="padding:6px 0;font-size:11px;letter-spacing:0.15em;color:#999;text-transform:uppercase;">${da ? "Telefon" : "Phone"}</td>
                    <td style="padding:6px 0;font-size:14px;color:#1a1a1a;">${phone}</td>
                  </tr>` : ""}
                  ${note ? `<tr>
                    <td style="padding:6px 0;font-size:11px;letter-spacing:0.15em;color:#999;text-transform:uppercase;">${da ? "Note" : "Note"}</td>
                    <td style="padding:6px 0;font-size:14px;color:#1a1a1a;">${note}</td>
                  </tr>` : ""}
                </table>
              </td></tr>
            </table>
            <p style="margin:0 0 12px;font-size:13px;color:#777;line-height:1.8;">
              ${da
                ? `Spørgsmål? Kontakt os på <a href="mailto:${restaurantEmail}" style="color:#1a1a1a;">${restaurantEmail}</a>`
                : `Questions? Contact us at <a href="mailto:${restaurantEmail}" style="color:#1a1a1a;">${restaurantEmail}</a>`
              }
            </p>
            <p style="margin:32px 0 0;font-size:14px;color:#555;">
              ${da ? "Vi ses snart," : "See you soon,"}<br />
              <strong style="color:#1a1a1a;">${restaurantName}</strong>
            </p>
          </td>
        </tr>
        <!-- Footer -->
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

    // ─── Restaurant notification email ──────────────────────────────────────
    const notifSubject = `Ny bordreservation – ${name}`;
    const notifHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:32px;background:#f7f7f5;font-family:'Georgia',serif;">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0e0e0;">
    <tr>
      <td style="background:#1a1a1a;padding:24px 36px;">
        <p style="margin:0;font-size:20px;letter-spacing:0.3em;color:#fff;font-weight:700;">BIRK</p>
        <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.2em;text-transform:uppercase;">Ny reservation</p>
      </td>
    </tr>
    <tr>
      <td style="padding:36px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;border-left:2px solid #1a1a1a;">
          <tr><td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;width:40%;">Navn</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">${name}</td></tr>
              <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;">Email</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">${email}</td></tr>
              <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;">Telefon</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">${phone || "–"}</td></tr>
              <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;">Dato</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">${dateStr}</td></tr>
              <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;">Tidspunkt</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">${timeStr}</td></tr>
              <tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;">Gæster</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">${guests}</td></tr>
              ${note ? `<tr><td style="padding:5px 0;font-size:11px;color:#999;letter-spacing:0.15em;text-transform:uppercase;">Note</td><td style="padding:5px 0;font-size:14px;color:#1a1a1a;">${note}</td></tr>` : ""}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send both emails in parallel
    const sendEmail = (to: string, subject: string, html: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Birk Restaurant <noreply@restaurantbirk.dk>",
          to: [to],
          subject,
          html,
        }),
      });

    const [guestRes, notifRes] = await Promise.all([
      sendEmail(email, guestSubject, guestHtml),
      sendEmail(restaurantEmail, notifSubject, notifHtml),
    ]);

    if (!guestRes.ok) {
      const err = await guestRes.text();
      console.error("Guest email failed:", err);
    }
    if (!notifRes.ok) {
      const err = await notifRes.text();
      console.error("Notif email failed:", err);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("birk-send-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
