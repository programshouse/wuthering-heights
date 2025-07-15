document.querySelectorAll(".book-page").forEach((page) => {
  const narratorVoice = "Microsoft Zira - English (United States)";
  const speedRange = document.getElementById("speedRange");
  const speedValue = document.getElementById("speedValue");

  let readingSpeed = speedRange ? parseFloat(speedRange.value) : 1.0;

  if (speedRange && speedValue) {
    speedRange.addEventListener("input", () => {
      readingSpeed = parseFloat(speedRange.value);
      speedValue.textContent = readingSpeed.toFixed(1);
    });
  }

  const btn = document.createElement("button");
  btn.className = "tts-toggle";
  btn.textContent = "▶";

  Object.assign(btn.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    width: "2rem",
    height: "2rem",
    top: "2.3rem",
    right: "6rem",
    backgroundColor: "#007bff",
    border: "none",
    color: "white",
    borderRadius: "2rem",
    cursor: "pointer",
    fontSize: "1rem",
    userSelect: "none",
    zIndex: "10",
  });

  const computedStyle = window.getComputedStyle(page);
  if (computedStyle.position === "static") {
    page.style.position = "relative";
  }

  page.appendChild(btn);

  const ttsElements = Array.from(page.querySelectorAll(".tts"));
  if (ttsElements.length === 0) {
    ttsElements.push(page);
  }

  let isSpeaking = false;
  let currentIndex = 0;
  let utterance = null;

  // Variable to hold the selected voice
  let selectedVoice = null;

  // Function to get the specific voice
  function getVoice() {
    return selectedVoice;
  }

  // Function to load voices
  function loadVoices() {
    let synthesis = window.speechSynthesis;

    // Regex to match all English language tags e.g en, en-US, en-GB
    let langRegex = /^en(-[a-z]{2})?$/i;

    // Get the available voices and filter the list to only have English speakers
    let voices = synthesis
      .getVoices()
      .filter(
        (voice) => langRegex.test(voice.lang) && voice.localService === true
      );

    selectedVoice = voices.find(
      (voice) => voice.name === narratorVoice // Use the narratorVoice variable defined in the HTML
    );

    // If the desired voice is not found, fall back to the first voice
    if (!selectedVoice) {
      selectedVoice = voices[0];
    }
  }

  // Wait for voices to be loaded before selecting the specific voice
  speechSynthesis.onvoiceschanged = loadVoices;

  // Fallback check if voices are not loaded immediately
  setInterval(() => {
    if (speechSynthesis.getVoices().length > 0 && !selectedVoice) {
      loadVoices(); // Try loading the voices every second until we find the desired one
    }
  }, 1000);

  function readElement(index) {
    if (index >= ttsElements.length) {
      stopReading();
      return;
    }

    const el = ttsElements[index];
    ttsElements.forEach((e) => e.classList.remove("speaking"));
    el.classList.add("speaking");

    utterance = new SpeechSynthesisUtterance(el.textContent.trim());
    utterance.rate = readingSpeed;
    utterance.voice = getVoice(); // Use the selected voice

    speechSynthesis.speak(utterance);

    utterance.onend = () => {
      currentIndex++;
      readElement(currentIndex);
    };

    utterance.onerror = () => {
      stopReading();
    };
  }

  function stopReading() {
    speechSynthesis.cancel();
    isSpeaking = false;
    currentIndex = 0;
    btn.textContent = "▶";
    btn.style.backgroundColor = "#007bff";
    ttsElements.forEach((e) => e.classList.remove("speaking"));
  }

  btn.addEventListener("click", () => {
    if (!isSpeaking) {
      isSpeaking = true;
      btn.textContent = "⏸";
      btn.style.backgroundColor = "#dc3545";
      currentIndex = 0;
      readElement(currentIndex);
    } else {
      stopReading();
    }
  });

  // --- New: Speak on click for each .tts element ---
  ttsElements.forEach((el) => {
    let clickUtterance = null;

    // Listen for a click event on each .tts element
    el.addEventListener("click", () => {
      // Cancel any existing speech before starting new
      speechSynthesis.cancel();

      // Remove "speaking" class from all elements across all pages
      const allTtsElements = document.querySelectorAll(".tts"); // Select all .tts elements across all pages
      allTtsElements.forEach((e) => e.classList.remove("speaking"));

      // Prepare the speech for the clicked element
      clickUtterance = new SpeechSynthesisUtterance(el.textContent.trim());
      clickUtterance.rate = readingSpeed;
      clickUtterance.voice = getVoice(); // Use the selected voice

      // Add the "speaking" class to the clicked element
      el.classList.add("speaking");

      // Speak the utterance
      speechSynthesis.speak(clickUtterance);
    });

    // Optionally stop the speech if the element is clicked again
    el.addEventListener("dblclick", () => {
      speechSynthesis.cancel();
      el.classList.remove("speaking");
    });
  });
});
