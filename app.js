const STORAGE_KEY = "reading-list-items-v1";

const titleInput = document.getElementById("titleInput");
const authorInput = document.getElementById("authorInput");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const template = document.getElementById("itemTemplate");

let items = loadItems();
render();

addBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();

  if (!title) {
    titleInput.focus();
    return;
  }

  items.unshift({
    id: crypto.randomUUID(),
    title,
    author: author || "Unknown author",
    bookmarked: false,
    highlighted: false,
  });

  titleInput.value = "";
  authorInput.value = "";
  titleInput.focus();

  persist();
  render();
});

listEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const itemEl = event.target.closest("li.item");
  if (!itemEl) return;

  const { id } = itemEl.dataset;
  const item = items.find((entry) => entry.id === id);
  if (!item) return;

  if (button.classList.contains("bookmark-btn")) {
    item.bookmarked = !item.bookmarked;
  } else if (button.classList.contains("highlight-btn")) {
    item.highlighted = !item.highlighted;
  } else if (button.classList.contains("remove-btn")) {
    items = items.filter((entry) => entry.id !== id);
  }

  persist();
  render();
});

function render() {
  listEl.innerHTML = "";

  for (const item of items) {
    const fragment = template.content.cloneNode(true);
    const li = fragment.querySelector("li");
    const title = fragment.querySelector(".title");
    const meta = fragment.querySelector(".meta");
    const bookmarkBtn = fragment.querySelector(".bookmark-btn");

    li.dataset.id = item.id;
    li.classList.toggle("highlighted", item.highlighted);

    title.textContent = item.title;
    meta.textContent = `by ${item.author}`;

    bookmarkBtn.classList.toggle("active", item.bookmarked);
    bookmarkBtn.textContent = item.bookmarked ? "★ Bookmarked" : "☆ Bookmark";

    fragment.querySelector(".highlight-btn").textContent = item.highlighted
      ? "Unhighlight"
      : "Highlight";

    listEl.append(fragment);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      title: String(item.title || "Untitled"),
      author: String(item.author || "Unknown author"),
      bookmarked: Boolean(item.bookmarked),
      highlighted: Boolean(item.highlighted),
    }));
  } catch {
    return [];
  }
}
