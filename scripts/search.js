const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const searchResultsList = document.getElementById("searchResultsList");

if (searchInput && searchBtn) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBtn.click();
    }
  });
}

const bookPages = Array.from(document.querySelectorAll(".book-page"));
function getPageNumberFromClass(pageElement) {
  const pgClass = Array.from(pageElement.classList).find((cls) =>
    /^pg-\d+$/.test(cls)
  );
  if (!pgClass) return null;
  return parseInt(pgClass.replace("pg-", ""), 10);
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function removeHighlights(element) {
  const highlights = element.querySelectorAll("span.highlight");
  highlights.forEach((span) => {
    span.outerHTML = span.textContent;
  });
}
function clearSearchResults() {
  searchResultsList.innerHTML = ""; 
}
function addSearchResult(page, snippet, pageNum) {
  const listItem = document.createElement("li");
  listItem.innerHTML = `<strong>Page ${pageNum}:</strong> ${snippet}`;
  listItem.addEventListener("click", () => {
    const pageNum = getPageNumberFromClass(page);
    if (pageNum) {
      goToPage(pageNum);
    }
  });
  searchResultsList.appendChild(listItem);
}

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a word to search");
    return;
  }
  const queryLower = query.toLowerCase();
  clearSearchResults();
  bookPages.forEach((page) => removeHighlights(page));
  const matchedPages = bookPages.filter((page) =>
    page.textContent.toLowerCase().includes(queryLower)
  );
  if (matchedPages.length > 0) {
    const pageNum = getPageNumberFromClass(matchedPages[0]);
    if (pageNum) {
      goToPage(pageNum);
    }
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    matchedPages.forEach((matchedPage) => {
      const textNodes = Array.from(matchedPage.childNodes).filter(
        (node) => node.nodeType === 3
      );

      textNodes.forEach((node) => {
        const matches = node.data.match(regex);
        if (matches) {
          const frag = document.createDocumentFragment();
          let lastIndex = 0;

          node.data.replace(regex, (match, p1, offset) => {
            const before = node.data.substring(lastIndex, offset);
            if (before) frag.appendChild(document.createTextNode(before));

            const span = document.createElement("span");
            span.className = "highlight";
            span.textContent = match;
            frag.appendChild(span);

            lastIndex = offset + match.length;
          });

          const after = node.data.substring(lastIndex);
          if (after) frag.appendChild(document.createTextNode(after));

          node.parentNode.replaceChild(frag, node);
        }
      });
      const matchIndex = matchedPage.textContent
        .toLowerCase()
        .indexOf(queryLower);
      const snippetStart = Math.max(0, matchIndex - 30);
      const snippetEnd = Math.min(
        matchedPage.textContent.length,
        matchIndex + 30 + query.length
      );
      const snippet = matchedPage.textContent.substring(
        snippetStart,
        snippetEnd
      );
      const highlightedSnippet = snippet.replace(
        regex,
        `<span class="highlight">${query}</span>`
      );
      const pageNum = getPageNumberFromClass(matchedPage);
      addSearchResult(matchedPage, highlightedSnippet, pageNum);
    });
  } else {
    alert("No matches found in the book");
  }
});
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  bookPages.forEach((page) => removeHighlights(page));
  clearSearchResults();
});
