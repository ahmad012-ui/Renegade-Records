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
