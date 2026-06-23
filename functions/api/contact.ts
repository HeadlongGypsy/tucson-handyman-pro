interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const form = await request.formData();
    const first_name = form.get("first_name")?.toString() ?? "";
    const last_name  = form.get("last_name")?.toString()  ?? "";
    const email      = form.get("email")?.toString()      ?? "";
    const phone      = form.get("phone")?.toString()      ?? "";
    const message    = form.get("message")?.toString()    ?? "";

    // Save to D1 database
    await env.DB.prepare(
      `INSERT INTO leads (first_name, last_name, email, phone, message)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(first_name, last_name, email, phone, message).run();

    // Send notification email to John
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tucson Handyman Pro <noreply@tucsonhandyman.pro>",
        to: ["johntmcdaid@gmail.com"],
        subject: `New Inquiry from ${first_name} ${last_name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${first_name} ${last_name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      }),
    });

    // Send confirmation email to customer
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tucson Handyman Pro <noreply@tucsonhandyman.pro>",
        to: [email],
        subject: "We received your message — Tucson Handyman Pro",
        html: `
          <p>Hi ${first_name},</p>
          <p>Thanks for reaching out! We received your message and will follow up within one business day.</p>
          <p>If you need to reach us sooner, give us a call at (520) 600-9872.</p>
          <br/>
          <p>— John<br/>Tucson Handyman Pro</p>
        `,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
