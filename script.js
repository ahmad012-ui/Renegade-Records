const mobileToggle = document.querySelector(".mobile-nav-toggle");
const navigation = document.getElementById("main-nav");

function closeNavigation() {
  navigation.classList.remove("is-open");
  mobileToggle.setAttribute("aria-expanded", "false");
  mobileToggle.setAttribute("aria-label", "Open navigation");
}

mobileToggle.addEventListener("click", () => {
  const open = mobileToggle.getAttribute("aria-expanded") === "true";
  mobileToggle.setAttribute("aria-expanded", String(!open));
  mobileToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("is-open", !open);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

const form = document.getElementById("inquiry-form");
const formNote = document.getElementById("form-note");
const submitButton = form.querySelector('button[type="submit"]');

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
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    let result;

    try {
      result = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error("The inquiry service returned an unexpected response. Please try again.");
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || `We couldn't send your inquiry (HTTP ${response.status}). Please try again.`);
    }

    formNote.textContent = result.message || "Your inquiry has been received.";
    formNote.classList.add(result.emailed === false ? "is-error" : "is-success");
    if (result.saved) form.reset();
  } catch (error) {
    formNote.textContent = error.message || "Something went wrong. Please try again or contact the studio directly.";
    formNote.classList.add("is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".service-row, .work-card, .studio-grid, .booking-grid").forEach((item) => {
    item.classList.add("reveal");
    observer.observe(item);
  });
}
