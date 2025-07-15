const fontSizeSlider = document.getElementById("fontSizeSlider");
const increaseFontBtn = document.getElementById("increaseFont");
const decreaseFontBtn = document.getElementById("decreaseFont");
const ttsElements = document.querySelectorAll(".tts");

const MIN_FONT_SIZE = 2;
const MAX_FONT_SIZE = 40;

let fontSizeInterval;

fontSizeSlider.addEventListener("input", () => {
  const size = parseInt(fontSizeSlider.value);
  changeFontSize(size);
});

increaseFontBtn.addEventListener("click", () => {
  let currentSize = parseInt(fontSizeSlider.value);
  let newSize = currentSize + 1;
  if (newSize <= MAX_FONT_SIZE) {
    changeFontSize(newSize);
  }
});

decreaseFontBtn.addEventListener("click", () => {
  let currentSize = parseInt(fontSizeSlider.value);
  let newSize = currentSize - 1;
  if (newSize >= MIN_FONT_SIZE) {
    changeFontSize(newSize);
  }
});

increaseFontBtn.addEventListener("mouseup", () => {
  clearInterval(fontSizeInterval);
});

decreaseFontBtn.addEventListener("mouseup", () => {
  clearInterval(fontSizeInterval);
});

increaseFontBtn.addEventListener("mouseleave", () => {
  clearInterval(fontSizeInterval);
});

decreaseFontBtn.addEventListener("mouseleave", () => {
  clearInterval(fontSizeInterval);
});

function changeFontSize(size) {
  size = Math.min(Math.max(size, MIN_FONT_SIZE), MAX_FONT_SIZE);
  ttsElements.forEach((el) => {
    el.style.fontSize = size + "px";
  });
  fontSizeSlider.value = size;
  document.getElementById("fontSizeSliderValue").textContent = size;
}
