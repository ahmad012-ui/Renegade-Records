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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const service = String(data.get("service") || "").trim();
  const message = String(data.get("message") || "").trim();
  const inquiry = [
    "Hello Renegade Records, I'd like to make an inquiry.",
    "",
    "Name: " + name,
    "Email: " + email,
    "Service: " + service,
    message ? "Project notes: " + message : ""
  ].filter(Boolean).join("\n");

  const whatsappUrl = "https://wa.me/923251052557?text=" + encodeURIComponent(inquiry);
  const whatsappWindow = window.open(whatsappUrl, "_blank");
  if (whatsappWindow) {
    whatsappWindow.opener = null;
  } else {
    window.location.assign(whatsappUrl);
  }
  formNote.textContent = "WhatsApp is opening with your inquiry. Review the message and press Send to contact Renegade Records.";
  formNote.classList.add("is-success");
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