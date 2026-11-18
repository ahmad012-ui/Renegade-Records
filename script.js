const mobileToggle = document.querySelector(".mobile-nav-toggle");
const navigation = document.getElementById("main-nav");

function closeNavigation() {
  if (!navigation || !mobileToggle) return;
  navigation.classList.remove("is-open");
  mobileToggle.setAttribute("aria-expanded", "false");
  mobileToggle.setAttribute("aria-label", "Open navigation");
}

if (mobileToggle && navigation) {
  mobileToggle.addEventListener("click", () => {
    const open = mobileToggle.getAttribute("aria-expanded") === "true";
    mobileToggle.setAttribute("aria-expanded", String(!open));
    mobileToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !open);
  });
  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
      closeNavigation();
      mobileToggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (navigation.classList.contains("is-open") && !navigation.contains(event.target) && !mobileToggle.contains(event.target)) closeNavigation();
  });
}

document.querySelectorAll("span").forEach((span) => {
  if (["↗", "↓", "/"].includes(span.textContent.trim())) span.setAttribute("aria-hidden", "true");
});

document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  const label = (link.getAttribute("aria-label") || link.textContent || "External link").trim();
  if (!label.toLowerCase().includes("opens in new tab")) {
    link.setAttribute("aria-label", label + " (opens in new tab)");
  }
});

document.querySelectorAll(".hero-photo, .work-image img, .studio-image img").forEach((image) => {
  image.addEventListener("error", () => { image.hidden = true; }, { once: true });
});

const form = document.getElementById("inquiry-form");
const formNote = document.getElementById("form-note");
const submitButton = form?.querySelector('button[type="submit"]');
const whatsappLink = "https://wa.me/923251052557?text=Hi%20Renegade%20Records%2C%20I%27d%20like%20to%20discuss%20a%20project.";

if (form && formNote && submitButton) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const payload = Object.fromEntries(new FormData(form).entries());
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    formNote.textContent = "SENDING YOUR INQUIRY…";
    formNote.classList.remove("is-success", "is-error");
    try {
      const response = await fetch("/api/submit-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000)
      });
      const raw = await response.text();
      let result;
      try { result = raw ? JSON.parse(raw) : {}; }
      catch { throw new Error("The inquiry service returned an unexpected response. Please try again."); }
      if (!response.ok || !result.success) throw new Error(result.message || "We couldn't send your inquiry. Please try again.");
      formNote.textContent = result.message || "Your inquiry has been received.";
      formNote.classList.add(result.emailed === false ? "is-error" : "is-success");
      if (result.saved) form.reset();
    } catch (error) {
      const networkFailure = error instanceof TypeError || error.name === "TimeoutError" || error.name === "AbortError";
      formNote.textContent = networkFailure
        ? "We couldn't reach the inquiry service. Please try again or contact the studio directly on WhatsApp."
        : (error.message || "Something went wrong. Please try again or contact the studio directly.");
      formNote.classList.add("is-error");
      if (networkFailure) {
        const link = document.createElement("a");
        link.href = whatsappLink;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = " Open WhatsApp (opens in new tab)";
        formNote.appendChild(link);
      }
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });
}
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); instance.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".service-row, .work-card, .studio-grid, .booking-grid").forEach((item) => {
    item.classList.add("reveal");
    observer.observe(item);
  });
}


// Automatic, muted hero image carousel. Pauses when the tab is hidden or reduced motion is preferred.
const heroPhoto = document.querySelector(".hero-photo");
const heroSlides = ["data:image/webp;base64,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", "data:image/webp;base64,UklGRmACAABXRUJQVlA4IFQCAADwGACdASp4ALQAP02exVqwq7m7qVW6O3ApiWkAAKHWViRVtGp1X1ihgl9y6f6sQtLWKG62qm31W05OGxNEfFFYb8GRSn3DVg67XSb1SRIfvDp1W92T9eTWjNl1K/CaxhRAegl6lByZnUVSyw4WQ3aTXVKPrbAYuwAxDrvlqTDdVujwwk6pkm+CIVyZsvyWPfSjt/PbjiCuS5sG4jcoT33Z7RF4LQP/ah+zK620v6bG7v3qpmV3rJYUtvtcpaUuQCy3GABaQcklgOEUXl6c4TtAAP7siThqzmL322tL8J231bz4aY/SDdlJbFYwNNlnvYHNLNv0Gm1LAq/8KVztdy1+n0wo6YWiy3TCp8f4NmJinaRIKWNU83tJNVnbNfRCqOXQJfRWFu3MjmfZRjhddLaNKk8QZVLLsLvwTgqiF6V6iN2nvpah/CG1ILV3pqNQ02SjKOOxo7JKP+AfPXR77bEEpg7eD6Cfepu3OktID+DDevIb33cS7bPRw7eecEpdJUEi4g+Xs+1q8PwvwL7LYWjnlQmssoGZYqGj1Y57mqfIc3vDweQSnMHO/Nc1gzY+onkoFSe/yJEl2Z04/9vlNOC4T9YAYUAvp3YaFmPLWNHrW153FVzNnR9G8v5MirUvmg2lkr/KMjXjGtqrltwZ5OGUn4g6p1q7cX2IakFrvejDe/izbwXwPaPF6eclXnRiQJccluyoZu4FhIns8ho18esgp0tX2IbOLCnSLu8XVTHFOzqdCYI3EQITyN7yuzxH1N5dnMN79+YivugrUdhF4cLPlgAAAA=="];
if (heroPhoto && heroSlides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let heroSlideIndex = 0;
  heroPhoto.style.transition = "opacity 900ms ease";
  window.setInterval(() => {
    if (document.hidden) return;
    heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
    heroPhoto.style.opacity = "0";
    window.setTimeout(() => {
      heroPhoto.src = heroSlides[heroSlideIndex];
      heroPhoto.style.opacity = "1";
    }, 900);
  }, 6500);
}
