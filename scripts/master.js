const totalPages = 98; // Total number of pages in the flipbook
let currentPage = 1; // Initialize current page
const flipbook = $(".flipbook");
const pageInput = document.getElementById("pageInput");
const goBtn = document.getElementById("goBtn");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

// Function to update the navigation buttons based on the current page
function updateNavButtons() {
  const currentPage = flipbook.turn("page");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // Hide or show the previous button based on current page
  if (prevBtn) prevBtn.style.display = currentPage <= 1 ? "none" : "flex";

  // Hide or show the next button based on current page
  if (nextBtn)
    nextBtn.style.display = currentPage >= totalPages ? "none" : "flex";
}

// Enable/disable the 'Go' button based on the input value validity
if (pageInput && goBtn) {
  // Initialize the 'Go' button to be disabled
  goBtn.disabled = true;

  // Event listener for input changes
  pageInput.addEventListener("input", () => {
    const val = pageInput.value.trim();
    // Enable the 'Go' button only if the input value is a positive integer >= 1
    if (/^\d+$/.test(val) && parseInt(val) >= 1) {
      goBtn.disabled = false;
    } else {
      goBtn.disabled = true;
    }
  });
}

// Event listener to go to the page when pressing the Enter key in the input field
if (pageInput) {
  pageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!goBtn.disabled) {
        goToPage();
      }
    }
  });
}

// Keyboard event listener for arrow key navigation (left and right arrows)
window.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement.tagName.toLowerCase();
  if (activeTag === "input" || activeTag === "textarea") return;

  // Move to the next page if the right arrow key is pressed
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goToNextPage();
  }
  // Move to the previous page if the left arrow key is pressed
  else if (event.key === "ArrowLeft") {
    event.preventDefault();
    goToPrevPage();
  }
});

// Function to update the progress bar based on the current page
function updateProgressBar() {
  // Calculate the progress as a percentage
  const progress = (currentPage / totalPages) * 100;
  progressBar.value = progress; // Update the progress bar value
  progressText.innerHTML = `Page ${currentPage} of ${totalPages}`; // Update the progress text
}

// Function to navigate to the next page
function goToNextPage() {
  const currentPageInFlipbook = flipbook.turn("page");
  if (currentPageInFlipbook < totalPages) {
    flipbook.turn("next"); // Move to the next page in the flipbook
    currentPage = flipbook.turn("page"); // Update the current page
    updateProgressBar();
    updateNavButtons();
  }
}

// Function to navigate to the previous page
function goToPrevPage() {
  const currentPageInFlipbook = flipbook.turn("page");
  if (currentPageInFlipbook > 1) {
    flipbook.turn("previous"); // Move to the previous page in the flipbook
    currentPage = flipbook.turn("page"); // Update the current page
    updateProgressBar();
    updateNavButtons();
  }
}

// Function to go to a specific page
function goToPage(pageNum = null) {
  if (pageNum === null) {
    if (!pageInput) return;

    pageNum = parseInt(pageInput.value);
    if (isNaN(pageNum)) {
      alert("من فضلك أدخل رقم صفحة صحيح"); // Alert if input is invalid
      return;
    }
  }

  // Navigate to the specified page if it's within the valid range
  if (pageNum >= 1 && pageNum <= totalPages) {
    flipbook.turn("page", pageNum); // Go to the specified page
    currentPage = pageNum; // Update the current page
    updateProgressBar();
    updateNavButtons();

    if (pageInput) {
      pageInput.value = ""; // Clear the page input field
      goBtn.disabled = true; // Disable the 'Go' button after navigating
    }
  } else {
    alert(`من فضلك أدخل رقم صفحة بين 1 و ${totalPages}`); // Alert if page number is out of range
  }
}

// Hook into the 'turning' event of the flipbook to track page transitions
flipbook.on("turning", function (event, page, view) {
  currentPage = page; // Update the current page whenever it changes
  updateProgressBar();
});

updateProgressBar();

//toggle features column
const sidebarToggle = document.getElementById("sidebarToggle");
const featureColumn = document.querySelector(".feature-column");
const bookWrapper = document.querySelector(".book-wrapper");

sidebarToggle.addEventListener("click", () => {
  featureColumn.classList.toggle("hidden");
  // bookWrapper.classList.toggle("centered");
});

// // Function to check screen width and redirect if necessary
// function checkScreenWidth() {
//   // Check if the screen width is less than or equal to 1000px
//   if (window.innerWidth <= 1000) {
//     // Redirect to the mobile version (can be any page, e.g., "mobile.html")
//     window.location.href = "../mobile/index.html";
//   }
// }

// // Check on page load
// window.onload = checkScreenWidth;

// // Optionally, also check when the window is resized
// window.onresize = checkScreenWidth;
