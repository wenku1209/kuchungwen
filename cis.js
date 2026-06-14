const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${(index % 4) * 60}ms`;
  revealObserver.observe(element);
});

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");

menuButton.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

header.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const dialog = document.querySelector(".image-dialog");
const dialogImage = dialog.querySelector("img");
const dialogIndex = dialog.querySelector(".dialog-index");
let currentImage = 1;

function showImage(imageNumber) {
  currentImage = Math.min(10, Math.max(1, imageNumber));
  const number = String(currentImage).padStart(2, "0");
  dialogImage.src = `assets/nodo-cis/nodo-cis-${number}.png`;
  dialogImage.alt = `NODO CIS 第 ${currentImage} 頁`;
  dialogIndex.textContent = number;
}

function openDialog(imageNumber) {
  showImage(imageNumber);
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

document.querySelectorAll("[data-image]").forEach((button) => {
  button.addEventListener("click", () => openDialog(Number(button.dataset.image)));
});

dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.querySelector(".prev").addEventListener("click", () => showImage(currentImage === 1 ? 10 : currentImage - 1));
dialog.querySelector(".next").addEventListener("click", () => showImage(currentImage === 10 ? 1 : currentImage + 1));

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

document.addEventListener("keydown", (event) => {
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") showImage(currentImage === 1 ? 10 : currentImage - 1);
  if (event.key === "ArrowRight") showImage(currentImage === 10 ? 1 : currentImage + 1);
});
