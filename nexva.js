const dialog = document.querySelector(".image-dialog");
const dialogImage = document.querySelector(".dialog-image");
const dialogCount = document.querySelector(".dialog-count");
const totalImages = 10;
let currentImage = 1;

function showImage(number) {
  currentImage = ((number - 1 + totalImages) % totalImages) + 1;
  const paddedNumber = String(currentImage).padStart(2, "0");
  dialogImage.src = `assets/nexva-cis/nexva-cis-${paddedNumber}.png`;
  dialogImage.alt = `NEXVA CIS page ${currentImage}`;
  dialogCount.textContent = `${paddedNumber} / ${totalImages}`;
}

document.querySelectorAll(".gallery-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    showImage(Number(trigger.dataset.image));
    dialog.showModal();
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
document.querySelector(".dialog-prev").addEventListener("click", () => showImage(currentImage - 1));
document.querySelector(".dialog-next").addEventListener("click", () => showImage(currentImage + 1));

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.addEventListener("keydown", (event) => {
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") showImage(currentImage - 1);
  if (event.key === "ArrowRight") showImage(currentImage + 1);
});
