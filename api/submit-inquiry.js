const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }

  const {
    name: rawName,
    email: rawEmail,
    phone: rawPhone,
    service: rawService,
    message: rawMessage,
    website: honeypot
  } = req.body || {};

  // Quietly reject automated submissions caught by the hidden honeypot.
  if (honeypot) return json(res, 200, { success: true });

  const name = clean(rawName, 100);
  const email = clean(rawEmail, 254);
  const phone = clean(rawPhone, 40);
  const service = clean(rawService, 120);
  const message = clean(rawMessage, 2000);

  if (!name || !email || !service || !message) {
    return json(res, 400, {
      success: false,
      message: "Please complete your name, email, service and project notes."
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { success: false, message: "Please enter a valid email address." });
  }

  const requiredEnv = [
    "GOOGLE_APPS_SCRIPT_URL",
    "GOOGLE_APPS_SCRIPT_SECRET",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "EMAIL_TO"
  ];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error("Missing server environment variables:", missing);
    return json(res, 500, {
      success: false,
      message: "The inquiry service is not fully configured yet. Please try again later."
    });
  }

  const inquiry = { name, email, phone, service, message };

  // Save to Sheets and send email independently: an email outage must not
  // prevent the inquiry from being recorded.
  const [sheetResult, emailResult] = await Promise.allSettled([
    (async () => {
      const response = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.GOOGLE_APPS_SCRIPT_SECRET,
          ...inquiry
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Google Sheets rejected the inquiry.");
      }
      return result;
    })(),
    (async () => {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [process.env.EMAIL_TO],
        replyTo: email,
        subject: `New Renegade Records inquiry — ${service}`,
        text: [
          "A new inquiry was submitted through the Renegade Records website.",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "Not provided"}`,
          `Service: ${service}`,
          "",
          "Project notes:",
          message
        ].join("\n")
      });
      if (result.error) throw new Error(result.error.message || "Resend failed.");
      return result;
    })()
  ]);

  const saved = sheetResult.status === "fulfilled";
  const emailed = emailResult.status === "fulfilled";

  if (!saved) console.error("Google Sheets save failed:", sheetResult.reason);
  if (!emailed) console.error("Resend email failed:", emailResult.reason);

  if (!saved) {
    return json(res, 502, {
      success: false,
      saved: false,
      emailed,
      message: "We couldn't save your inquiry. Please try again or contact the studio directly."
    });
  }

  return json(res, 200, {
    success: true,
    saved: true,
    emailed,
    inquiryId: sheetResult.value.inquiryId,
    message: emailed
      ? "Your inquiry has been received. Renegade Records will be in touch."
      : "Your inquiry was saved, but the email notification could not be sent. Please try again later if you don't hear back."
  });
};
