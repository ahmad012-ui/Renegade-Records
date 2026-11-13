# Renegade Noir — Renegade Records website

Production website for **Renegade Records**, with **Renegade Music Productions** presented as its music-production division.

## Live website

https://renegadenoir.vercel.app/

## Brand and experience

- Visual direction: 70% luxury / 30% underground, dark cinematic minimalism.
- Palette: Obsidian #0B0B0D, Charcoal #202024, Crimson #C1122F, Ivory #F2F0EB, Steel Grey #85858B.
- Typography: Space Grotesk display, Inter body.
- Main message: “WE DON'T FOLLOW THE SOUND. WE CREATE IT.”
- Sections: Home, About, Services, Our Work, The Studio, Contact.
- No automatic audio playback.
- Responsive navigation and reduced-motion support.

## Contact form

The inquiry form validates the required fields and opens WhatsApp with the visitor's name, email, selected service and project notes prefilled. The visitor reviews the message and presses Send in WhatsApp. The website does not store or transmit form submissions to its own server.

The public studio WhatsApp contact currently used by the form is +92 325 1052557. Confirm this remains the owner's preferred booking number before the final public launch.

## Portfolio references

The portfolio cards link to public posts from the Renegade Studio Instagram account:

- **Saara Din TikTok** — Ateeq Saavn.
- **Ik Numberi** — Farhan Javed.
- **Midnight Vibe** — Maalik × 2Ace.
- **Baaton Ka Makan** — Aalyan Rao.

Confirm final artist names, production credits and image-use approval with the owner before publication.

## Remaining launch checks

1. Replace Instagram CDN image URLs with approved local image files. The current signed CDN URLs can expire and should not be treated as permanent website assets.
2. Supply and approve original wide studio photography for the hero and studio sections.
3. Confirm the official booking WhatsApp number, business email, studio address and location pin. The site currently does not publish an email or street address because verified details have not been supplied.
4. Test the inquiry flow on Android, iPhone and desktop, including browsers with popup restrictions.
5. Run a final accessibility and performance audit (keyboard navigation, contrast, image loading, mobile layout and Core Web Vitals).
6. Confirm the Vercel production project is connected to this repository and that the custom production domain points to the intended project.

## Local preview

No build step or package installation is required:

    python -m http.server 8000

Then open http://localhost:8000.

## Files

- `index.html` — semantic page structure, metadata, structured organization data and content.
- `styles.css` — visual system and responsive layout.
- `script.js` — mobile navigation, inquiry form and scroll reveal behavior.
- `favicon.svg` — Renegade monogram.
- `robots.txt` and `sitemap.xml` — basic search-engine discovery.
