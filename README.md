# Renegade Records website

Production website for **Renegade Records**, with **Renegade Music Productions** presented as its music-production division.

## Live website

https://renegade-records-one.vercel.app/

## Brand and experience

- Dark cinematic minimalism.
- Obsidian, charcoal, crimson, ivory and steel-grey palette.
- Space Grotesk display and Inter body typography.
- Main message: “WE DON'T FOLLOW THE SOUND. WE CREATE IT.”
- Home, About, Services, Our Work, The Studio and Contact sections.
- No automatic audio playback.
- Responsive navigation, reduced-motion support and keyboard focus states.

## Inquiry workflow

The contact form stays on the website. On submission, the server saves the inquiry to Google Sheets and submits it to Formspree. Formspree sends the email notification to the recipient configured in its dashboard. WhatsApp Cloud API notifications remain optional until the owner provides Meta Business access, a sender number, credentials and an approved template.

The public studio WhatsApp contact is +92 325 1052557. Visitors can also open a separate click-to-chat link.

## Launch checks requiring owner input or external testing

1. Replace expiring Instagram CDN image URLs with approved local originals. The owner must approve usage and provide the source files.
2. Supply approved original wide studio photography for the hero and studio sections.
3. Confirm the official booking WhatsApp number, business email, studio address and location pin.
4. Configure and test Formspree notifications to renegaderecordsusa@gmail.com.
5. Provide Meta Business access to enable official WhatsApp Cloud API notifications.
6. Configure persistent rate limiting (Upstash/Vercel KV) or Turnstile before public promotion.
7. Run real end-to-end form, accessibility, responsive and Lighthouse tests on the deployed Preview.

## Local preview

No build step or package installation is required:

    python -m http.server 8000

Then open http://localhost:8000.
