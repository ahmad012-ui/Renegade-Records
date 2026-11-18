# Renegade Records inquiry notifications

## Visitor experience

The contact form stays on the website. Submitting it sends the inquiry to the server; it does not open WhatsApp or an email app. The server saves the inquiry to Google Sheets and submits it to Formspree, which sends the notification email to the recipient configured in the Formspree dashboard. Once Meta credentials and an approved template are configured, it also sends a WhatsApp notification in the background.

The contact section and footer include a separate WhatsApp link for visitors who prefer to start a conversation themselves.

## Vercel environment variables

Add these as server-side environment variables in the Vercel project. Do not prefix secrets with `NEXT_PUBLIC_` and do not commit real values to Git.

Required:
- `GOOGLE_APPS_SCRIPT_URL`: the deployed Apps Script Web App URL ending in `/exec`.
- `GOOGLE_APPS_SCRIPT_SECRET`: the same private shared secret configured in Apps Script.
- `FORMSPREE_ENDPOINT`: the dashboard form endpoint, in the format `https://formspree.io/f/your-form-id`. Configure the Formspree form's notification recipient as `renegaderecordsusa@gmail.com`.

The website is a plain HTML/JavaScript site, not a React app. Use a **Dashboard project** in Formspree and create a form there. A Formspree CLI project (Project ID + Deploy Key) is intended for the CLI/React workflow and is not the endpoint URL used by this website.

## Optional WhatsApp Cloud API

- `WHATSAPP_API_VERSION`: Graph API version, currently set to `v27.0`.
- `WHATSAPP_ACCESS_TOKEN`: Meta access token with WhatsApp messaging permission.
- `WHATSAPP_PHONE_NUMBER_ID`: the Cloud API sender's Phone Number ID (not the visible phone number).
- `WHATSAPP_TO`: recipient number in international digits-only format; default target is `923251052557`.
- `WHATSAPP_TEMPLATE_NAME`: approved message template name; proposed name is `new_website_inquiry`.
- `WHATSAPP_TEMPLATE_LANGUAGE`: approved template language, default `en_US`.

WhatsApp notifications are skipped until all four required WhatsApp variables (token, sender Phone Number ID, recipient and template name) are set. A WhatsApp failure does not prevent the inquiry from being saved or emailed.

## WhatsApp template to create in WhatsApp Manager

Create and get approval for a Utility template with:
- Name: `new_website_inquiry`
- Language: English (US) / `en_US`
- Body:

```text
New website inquiry received for Renegade Records.

Name: {{1}}
Email: {{2}}
Phone: {{3}}
Service: {{4}}

Project notes:
{{5}}
```

The template must contain exactly five body variables in this order to match the server request. Meta may review and approve or reject the template.

## Important sender/recipient distinction

The WhatsApp Cloud API sender must be a different number from the recipient. The temporary Meta test number can send to Renegade's official WhatsApp number after that number is added and verified as an allowed test recipient. For production, use a separate Cloud API sender number and keep `923251052557` as the notification recipient. Do not register Renegade's public contact number as the sender if it is also the notification recipient.

Messages initiated by the business outside an active customer-service window require an approved template. The website notification uses a template for that reason.

## Deployment

The current work is on `feature/contact-form-automation`. It is not merged into production. Configure the two required Vercel Preview environment variables and deploy a Preview before merging.
