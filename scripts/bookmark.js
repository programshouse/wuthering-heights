let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
let currentBookmark = null;
const addBookmarkBtn = document.getElementById("addBookmarkBtn");
const bookmarkIcon = document.getElementById("bookmarkIcon");
const bookmarksList = document.getElementById("bookmarksList");
const bookmarksDropdown = document.getElementById("bookmarksDropdown");

if (bookmarks.length > 0) {
  displayBookmarks();
}

function toggleBookmark() {
  const currentPage = getCurrentPage();

  if (bookmarks.includes(currentPage)) {
    removeBookmark(currentPage);
  } else {
    addBookmark(currentPage);
  }
}

function addBookmark(page) {
  if (!bookmarks.includes(page)) {
    bookmarks.push(page);
    currentBookmark = page;
    updateBookmarkIcon(true);
    saveBookmarks();
  }
  displayBookmarks();
}

function removeBookmark(page) {
  bookmarks = bookmarks.filter((bookmark) => bookmark !== page);
  currentBookmark = null;
  updateBookmarkIcon(false);
  saveBookmarks();
  displayBookmarks();
}

function updateBookmarkIcon(isBookmarked) {
  const currentPage = getCurrentPage();

  if (currentBookmark === currentPage) {
    bookmarkIcon.style.color = "yellow";
  } else {
    bookmarkIcon.style.color = "white";
  }
}
function getCurrentPage() {
  return flipbook.turn("page");
}
function displayBookmarks() {
  bookmarksList.innerHTML =
    bookmarks.length > 0
      ? bookmarks
          .map(
            (page) =>
              `<li><button onclick="goToPage(${page})">${page}</button></li>`
          )
          .join("")
      : "No bookmarks yet.";
  bookmarksDropdown.style.display = "block";
}
function saveBookmarks() {
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}
function toggleDropdown() {
  const dropdownContent = document.getElementById("bookmarksList");
  if (dropdownContent.style.display === "block") {
    dropdownContent.style.display = "none";
  } else {
    dropdownContent.style.display = "block";
  }
}
bookmarksDropdown.addEventListener("click", toggleDropdown);
addBookmarkBtn.addEventListener("click", toggleBookmark);

