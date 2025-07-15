let currentAudio = null;
let currentPlaybackRate = 1;
const synth = window.speechSynthesis;
let isPlaying = false;
let currentAudioIndex = 0;
let pageAudioElements = [];
let currentPageButton = null;
let isPagePlayback = false;
let mutationObserver = null;
let playbackTimeout = null;

function initializeSpeedControls() {
  const speedRange = document.getElementById("speedRange");
  const speedValue = document.getElementById("speedValue");

  if (speedRange && speedValue) {
    speedRange.addEventListener("input", (e) => {
      currentPlaybackRate = parseFloat(e.target.value);
      speedValue.textContent = currentPlaybackRate.toFixed(1);

      if (currentAudio && !currentAudio.paused) {
        currentAudio.playbackRate = currentPlaybackRate;
      }
    });

    currentPlaybackRate = parseFloat(speedRange.value) || 1;
    speedValue.textContent = currentPlaybackRate.toFixed(1);
  }
}

function stopCurrentPlayback() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  synth.cancel();

  if (playbackTimeout) {
    clearTimeout(playbackTimeout);
    playbackTimeout = null;
  }

  document
    .querySelectorAll(".hover-active")
    .forEach((el) => el.classList.remove("hover-active"));
}

function stopAllPageAudio() {
  pageAudioElements.forEach((audio) => {
    if (audio.element && audio.element.pause) {
      audio.element.pause();
      audio.element.currentTime = 0;
    }
  });

  synth.cancel();

  if (playbackTimeout) {
    clearTimeout(playbackTimeout);
    playbackTimeout = null;
  }

  if (currentPageButton) {
    currentPageButton.textContent = "▶";
    currentPageButton.style.backgroundColor = getButtonColor(
      currentPageButton.pageElement,
      false
    );
    currentPageButton = null;
  }

  isPlaying = false;
  isPagePlayback = false;
  currentAudioIndex = 0;

  document
    .querySelectorAll(".hover-active")
    .forEach((el) => el.classList.remove("hover-active"));
}

function playNextAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  synth.cancel();

  if (currentAudioIndex >= pageAudioElements.length) {
    stopAllPageAudio();
    return;
  }

  const audioData = pageAudioElements[currentAudioIndex];

  if (audioData.originalElement) {
    document
      .querySelectorAll(".hover-active")
      .forEach((el) => el.classList.remove("hover-active"));
    audioData.originalElement.classList.add("hover-active");
  }

  if (audioData.type === "file") {
    const audio = new Audio(audioData.src);
    audio.playbackRate = currentPlaybackRate;
    audioData.element = audio;
    currentAudio = audio;

    let hasEnded = false;

    const handleEnd = () => {
      if (hasEnded) return;
      hasEnded = true;

      if (audioData.originalElement) {
        audioData.originalElement.classList.remove("hover-active");
      }
      currentAudio = null;
      currentAudioIndex++;

      playbackTimeout = setTimeout(() => {
        if (isPagePlayback) {
          playNextAudio();
        }
      }, 100);
    };

    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("error", handleEnd);

    audio.play().catch(handleEnd);
  } else if (audioData.type === "tts") {
    const utterance = new SpeechSynthesisUtterance(audioData.text);
    utterance.lang = "en";
    utterance.rate = currentPlaybackRate;

    let hasEnded = false;

    const handleEnd = () => {
      if (hasEnded) return;
      hasEnded = true;

      if (audioData.originalElement) {
        audioData.originalElement.classList.remove("hover-active");
      }
      currentAudioIndex++;

      playbackTimeout = setTimeout(() => {
        if (isPagePlayback) {
          playNextAudio();
        }
      }, 100);
    };

    utterance.addEventListener("end", handleEnd);
    utterance.addEventListener("error", handleEnd);

    const ttsTimeout = setTimeout(handleEnd, 10000);

    utterance.addEventListener("end", () => clearTimeout(ttsTimeout));
    utterance.addEventListener("error", () => clearTimeout(ttsTimeout));

    synth.speak(utterance);
  }
}

function startAllAudio(pageElement) {
  loadAudioForPage(pageElement);

  if (pageAudioElements.length > 0) {
    isPagePlayback = true;
    currentAudioIndex = 0;
    playNextAudio();
  } else {
    stopAllPageAudio();
  }
}

function loadAudioForPage(pageElement) {
  pageAudioElements = [];

  if (!pageElement) return;

  const audioFileElements = pageElement.querySelectorAll(
    '[data-type="file"][data-audio]'
  );
  const ttsElements = pageElement.querySelectorAll(
    '[data-type="tts"][data-text]'
  );

  const allAudioElements = [];

  audioFileElements.forEach((element) => {
    allAudioElements.push({
      element: element,
      type: "file",
      position: getElementPosition(element),
    });
  });

  ttsElements.forEach((element) => {
    allAudioElements.push({
      element: element,
      type: "tts",
      position: getElementPosition(element),
    });
  });

  allAudioElements.sort((a, b) => {
    if (Math.abs(a.position.top - b.position.top) > 10) {
      return a.position.top - b.position.top;
    }
    return a.position.left - b.position.left;
  });

  allAudioElements.forEach((item) => {
    if (item.type === "file") {
      pageAudioElements.push({
        type: "file",
        src: item.element.dataset.audio,
        element: null,
        originalElement: item.element,
      });
    } else if (item.type === "tts") {
      pageAudioElements.push({
        type: "tts",
        text: item.element.dataset.text,
        element: null,
        originalElement: item.element,
      });
    }
  });
}

function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
}

function getButtonColor(pageElement, isActive) {
  if (isActive) return "#dc3545";

  const audioElements = pageElement.querySelectorAll(
    '[data-type="file"][data-audio], [data-type="tts"][data-text]'
  );
  return audioElements.length > 0 ? "#007bff" : "transparent";
}

function addPlayPauseButtonToPage(pageElement) {
  const existingButton = pageElement.querySelector(".audio-toggle");
  if (existingButton) return;

  let referenceElement = pageElement.querySelector(
    '.page-number, [class*="page-number"], .page-num, [class*="page-num"], .page-header, [class*="page-header"]'
  );

  if (!referenceElement) {
    referenceElement = pageElement.querySelector('[class*="page"]');
  }

  if (!referenceElement) {
    referenceElement = pageElement.firstElementChild;
  }

  if (!referenceElement) return;

  const btn = document.createElement("button");
  btn.className = "audio-toggle";
  btn.textContent = "▶";
  btn.pageElement = pageElement;

  const hasAudio =
    pageElement.querySelectorAll(
      '[data-type="file"][data-audio], [data-type="tts"][data-text]'
    ).length > 0;

  Object.assign(btn.style, {
    display: "block",
    position: "absolute",
    width: "2rem",
    height: "2rem",
    top: "2.2rem",
    right: "7rem",
    backgroundColor: getButtonColor(pageElement, false),
    border: "none",
    color: "white",
    borderRadius: "2rem",
    cursor: "pointer",
    fontSize: "1rem",
    userSelect: "none",
    zIndex: "1000",
    opacity: hasAudio ? "1" : "0",
    transition: "all 0.2s ease",
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentAudioElements = pageElement.querySelectorAll(
      '[data-type="file"][data-audio], [data-type="tts"][data-text]'
    );

    if (currentAudioElements.length === 0) {
      btn.style.backgroundColor = "#dc3545";
      setTimeout(() => {
        btn.style.backgroundColor = "#007bff";
      }, 500);
      return;
    }

    if (isPlaying && currentPageButton === btn) {
      stopAllPageAudio();
    } else {
      stopCurrentPlayback();
      stopAllPageAudio();

      currentPageButton = btn;
      btn.textContent = "⏸";
      btn.style.backgroundColor = "#dc3545";
      isPlaying = true;

      startAllAudio(pageElement);
    }
  });

  btn.addEventListener("mouseenter", () => {
    if (btn !== currentPageButton) {
      btn.style.backgroundColor = hasAudio ? "#0056b3" : "#5a6268";
    }
  });

  btn.addEventListener("mouseleave", () => {
    if (btn !== currentPageButton) {
      btn.style.backgroundColor = getButtonColor(pageElement, false);
    }
  });

  pageElement.style.position = pageElement.style.position || "relative";
  pageElement.appendChild(btn);
}

function processPageElement(pageElement) {
  const hasPageIndicator = pageElement.querySelector(
    '.page-number, [class*="page-number"]'
  );
  Array.from(pageElement.classList).some((cls) => cls.includes("page"));

  if (hasPageIndicator) {
    addPlayPauseButtonToPage(pageElement);
  }
}

function setupMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            processPageElement(node);
            const selectors = ['[class*="page-number"]'];
            selectors.forEach((selector) => {
              node.querySelectorAll &&
                node.querySelectorAll(selector).forEach(processPageElement);
            });
          }
        });
      }
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

document.addEventListener("click", (e) => {
  const element = e.target.closest("[data-type]");
  if (!element) return;

  if (e.target.closest(".audio-toggle")) return;

  const type = element.dataset.type;

  stopCurrentPlayback();
  stopAllPageAudio();

  element.classList.add("hover-active");
  isPagePlayback = false;

  if (type === "file") {
    const audioSrc = element.dataset.audio;
    if (!audioSrc) {
      element.classList.remove("hover-active");
      return;
    }

    currentAudio = new Audio(audioSrc);
    currentAudio.playbackRate = currentPlaybackRate;

    currentAudio.addEventListener("loadeddata", () => {
      currentAudio.playbackRate = currentPlaybackRate;
    });

    currentAudio.play().catch(() => {
      element.classList.remove("hover-active");
    });

    currentAudio.addEventListener("ended", () => {
      element.classList.remove("hover-active");
      currentAudio = null;
    });
  } else if (type === "tts") {
    const text = element.dataset.text;
    if (!text) {
      element.classList.remove("hover-active");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en";
    utterance.rate = currentPlaybackRate;

    utterance.addEventListener("end", () => {
      element.classList.remove("hover-active");
    });

    utterance.addEventListener("error", () => {
      element.classList.remove("hover-active");
    });

    synth.speak(utterance);
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeSpeedControls();
    setupMutationObserver();
  });
} else {
  initializeSpeedControls();
  setupMutationObserver();
}

window.addEventListener("beforeunload", () => {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  if (playbackTimeout) {
    clearTimeout(playbackTimeout);
  }
});
