const header = document.querySelector("[data-site-header]");

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll("img[data-static]").forEach((image) => {
    image.src = image.dataset.static;
  });
}

if (header) {
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

const galleryButtons = document.querySelectorAll("[data-screen]");
const galleryImage = document.querySelector("[data-gallery-image]");
const galleryTitle = document.querySelector("[data-gallery-title]");
const galleryCaption = document.querySelector("[data-gallery-caption]");

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    galleryButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    if (galleryImage) {
      galleryImage.src = button.dataset.screen;
      galleryImage.alt = `${button.dataset.title}画面`;
    }

    if (galleryTitle) {
      galleryTitle.textContent = button.dataset.title;
    }

    if (galleryCaption) {
      galleryCaption.textContent = button.dataset.caption;
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
