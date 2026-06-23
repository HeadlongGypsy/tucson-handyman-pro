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

    // Check if customer already exists
    const existing = await env.DB.prepare(
      `SELECT id FROM customers WHERE email = ?`
    ).bind(email).first();

    let customer_id: number;

    if (existing) {
      // Customer already exists — use their ID
      customer_id = existing.id as number;
    } else {
      // New customer — create record
      const result = await env.DB.prepare(
        `INSERT INTO customers (first_name, last_name, email, phone, source)
         VALUES (?, ?, ?, ?, ?)
         RETURNING id`
      ).bind(first_name, last_name, email, phone, "contact_form").first();
      customer_id = result!.id as number;

      // Tag new customer
      await env.DB.prepare(
        `INSERT INTO tags (customer_id, tag) VALUES (?, ?)`
      ).bind(customer_id, "general_inquiry").run();

      await env.DB.prepare(
        `INSERT INTO tags (customer_id, tag) VALUES (?, ?)`
      ).bind(customer_id, "contact_form").run();
    }

    // Save lead linked to customer
    await env.DB.prepare(
      `INSERT INTO leads (customer_id, first_name, last_name, email, phone, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(customer_id, first_name, last_name, email, phone, message, "new").run();

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
          <p><strong>Customer ID:</strong> ${customer_id}</p>
          <p><strong>Status:</strong> New lead</p>
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
