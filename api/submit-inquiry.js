const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v27.0";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function clean(value, maxLength) {
  return String(value || "").replace(/[\r\n\t]+/g, " ").replace(/ {4,}/g, " ").trim().slice(0, maxLength);
}

async function readJson(response, serviceName) {
  const raw = await response.text();
  let result;

  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`${serviceName} returned an unreadable response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(result.error?.message || result.message || `${serviceName} request failed (HTTP ${response.status}).`);
  }

  return result;
}

function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_TO &&
    process.env.WHATSAPP_TEMPLATE_NAME
  );
}

async function sendWhatsAppNotification(inquiry) {
  const response = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: process.env.WHATSAPP_TO.replace(/[^0-9]/g, ""),
        type: "template",
        template: {
          name: process.env.WHATSAPP_TEMPLATE_NAME,
          language: {
            code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US"
          },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: inquiry.name },
              { type: "text", text: inquiry.email },
              { type: "text", text: inquiry.phone || "Not provided" },
              { type: "text", text: inquiry.service },
              { type: "text", text: clean(inquiry.message || "No project notes provided", 1024) }
            ]
          }]
        }
      })
    }
  );

  const result = await readJson(response, "WhatsApp");
  if (result.error) throw new Error(result.error.message || "WhatsApp notification failed.");
  return result;
}

async function saveToGoogleSheets(inquiry) {
  const response = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      secret: process.env.GOOGLE_APPS_SCRIPT_SECRET,
      ...inquiry
    })
  });

  const result = await readJson(response, "Google Sheets");
  if (!result.success) {
    throw new Error(result.message || "Google Sheets rejected the inquiry.");
  }
  return result;
}

async function sendFormspreeEmail(inquiry) {
  const endpoint = process.env.FORMSPREE_ENDPOINT;
  const parsedEndpoint = new URL(endpoint);

  if (
    parsedEndpoint.protocol !== "https:" ||
    parsedEndpoint.hostname !== "formspree.io" ||
    !parsedEndpoint.pathname.startsWith("/f/")
  ) {
    throw new Error("FORMSPREE_ENDPOINT must be a valid https://formspree.io/f/... form endpoint.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      ...inquiry,
      _subject: `New Renegade Records inquiry — ${inquiry.service}`,
      _replyto: inquiry.email
    })
  });

  const result = await readJson(response, "Formspree");
  if (result.errors?.length) {
    throw new Error(result.errors.map((item) => item.message).join("; "));
  }
  return result;
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

  // Quietly accept automated submissions caught by the hidden honeypot.
  if (honeypot) return json(res, 200, { success: true, saved: true });

  const inquiry = {
    name: clean(rawName, 100),
    email: clean(rawEmail, 254),
    phone: clean(rawPhone, 40),
    service: clean(rawService, 120),
    message: clean(rawMessage, 2000)
  };

  if (!inquiry.name || !inquiry.email || !inquiry.service || !inquiry.message) {
    return json(res, 400, {
      success: false,
      message: "Please complete your name, email, service and project notes."
    });
  }

  if (!/^[^@ ]+@[^@ ]+[.][^@ ]+$/.test(inquiry.email)) {
    return json(res, 400, { success: false, message: "Please enter a valid email address." });
  }

  const requiredEnv = [
    "GOOGLE_APPS_SCRIPT_URL",
    "GOOGLE_APPS_SCRIPT_SECRET",
    "FORMSPREE_ENDPOINT"
  ];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error("Missing server environment variables:", missing);
    return json(res, 500, {
      success: false,
      message: "The inquiry service is not fully configured yet. Please try again later."
    });
  }

  const whatsappConfigured = isWhatsAppConfigured();

  const [sheetResult, emailResult, whatsappResult] = await Promise.allSettled([
    saveToGoogleSheets(inquiry),
    sendFormspreeEmail(inquiry),
    whatsappConfigured
      ? sendWhatsAppNotification(inquiry)
      : Promise.resolve({ skipped: true, reason: "WhatsApp credentials are not configured yet." })
  ]);

  const saved = sheetResult.status === "fulfilled";
  const emailed = emailResult.status === "fulfilled";
  const whatsappSent = whatsappConfigured && whatsappResult.status === "fulfilled";

  if (!saved) console.error("Google Sheets save failed:", sheetResult.reason);
  if (!emailed) console.error("Formspree email failed:", emailResult.reason);
  if (whatsappConfigured && !whatsappSent) {
    console.error("WhatsApp notification failed:", whatsappResult.reason);
  }

  if (!saved) {
    return json(res, 502, {
      success: false,
      saved: false,
      emailed,
      whatsappSent,
      message: "We couldn't save your inquiry. Please try again or contact the studio directly."
    });
  }

  return json(res, 200, {
    success: true,
    saved: true,
    emailed,
    whatsappSent,
    inquiryId: sheetResult.value.inquiryId,
    message: emailed
      ? "Your inquiry has been received. Renegade Records will be in touch."
      : "Your inquiry has been saved, but our email notification failed. For urgent requests, please contact us on WhatsApp."
  });
};
