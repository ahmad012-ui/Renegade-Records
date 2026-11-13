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
  formNote.textContent = "PREVIEW ONLY — NO MESSAGE WAS SENT. CONNECT THE APPROVED EMAIL OR WHATSAPP DESTINATION BEFORE LAUNCH.";
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