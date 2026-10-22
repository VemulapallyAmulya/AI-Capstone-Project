import React, { useEffect, useMemo, useRef, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "/api";
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const localBookCovers = {
  "the quiet morning": "/book-covers/the-quiet-morning.svg",
  "learn better": "/book-covers/learn-better.svg",
  "beyond the stars": "/book-covers/beyond-the-stars.svg",
  "the last train home": "/book-covers/the-last-train-home.svg",
  "small habits": "/book-covers/small-habits.svg",
  "the green planet": "/book-covers/the-green-planet.svg"
};

const displayDate = (date) => {
  if (!date) return "Publication date unavailable";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
};

function escapeXml(value) {
  return String(value || "").replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;"
  })[character]);
}

function makeBookCover(book) {
  const palettes = [
    ["#c87d55", "#552d38", "#f4c17a", "#fff0d9"],
    ["#688b86", "#183f4a", "#e1b96d", "#f3edda"],
    ["#8873a8", "#302b54", "#efa9a0", "#fff0dd"],
    ["#a7a65f", "#3b503b", "#e9c881", "#f5efd8"],
    ["#d1838b", "#713d56", "#f1c477", "#fff0e6"],
    ["#6282aa", "#293c66", "#e9ac69", "#f3ead6"],
    ["#ba8a5e", "#684634", "#d4bd84", "#fff0d8"],
    ["#6e9d72", "#29463e", "#d3bf76", "#f3edd8"],
    ["#aa795f", "#543b50", "#e3ae87", "#faecdf"],
    ["#588c9c", "#234453", "#e3c276", "#f4efdc"],
    ["#a888b3", "#493c67", "#e5bd7c", "#f7ebdf"],
    ["#8d9b68", "#445241", "#d79a6e", "#f2edd8"]
  ];
  let hash = 0;
  const identity = `${book.title || ""}|${book.author || ""}|${book.category || ""}`;
  for (let index = 0; index < identity.length; index++) {
    hash = (hash * 31 + identity.charCodeAt(index)) >>> 0;
  }
  const [light, dark, accent, paper] = palettes[hash % palettes.length];
  const variant = hash % 5;
  const titleWords = String(book.title || "A ReadNest Story").toUpperCase().split(/\s+/);
  const titleLines = [];
  let currentLine = "";
  titleWords.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > 17 && currentLine) {
      titleLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });
  if (currentLine) titleLines.push(currentLine);
  const title = titleLines.slice(0, 3).map(escapeXml);
  const author = escapeXml(book.author);
  const category = escapeXml(book.category).toUpperCase();
  const artwork = [
    `<path d="M75 355V205a165 165 0 0 1 330 0v150" fill="${accent}" fill-opacity=".2" stroke="${paper}" stroke-opacity=".62" stroke-width="2"/><circle cx="320" cy="205" r="55" fill="${paper}" fill-opacity=".83"/><path d="M76 355h330" stroke="${paper}" stroke-opacity=".8" stroke-width="3"/><path d="M90 325c75-45 125-45 205 0s110 20 130-5" fill="none" stroke="${light}" stroke-width="9" stroke-linecap="round"/>`,
    `<circle cx="328" cy="206" r="94" fill="${accent}" fill-opacity=".85"/><circle cx="328" cy="206" r="66" fill="${dark}"/><circle cx="328" cy="206" r="34" fill="${paper}"/><path d="M70 285 155 170l75 92 52-70 130 151H70z" fill="${light}" fill-opacity=".8"/><path d="M70 327h340" stroke="${paper}" stroke-opacity=".72" stroke-width="2"/>`,
    `<path d="M72 270c0-105 75-190 168-190s168 85 168 190v87H72z" fill="${accent}" fill-opacity=".68"/><path d="M103 270c0-85 61-154 137-154s137 69 137 154v87H103z" fill="${dark}" fill-opacity=".7"/><path d="M72 355c70-40 122-38 190 0s118 36 146-2" fill="none" stroke="${paper}" stroke-width="3"/><circle cx="324" cy="174" r="25" fill="${paper}" fill-opacity=".85"/>`,
    `<path d="M65 126h350v220H65z" fill="${accent}" fill-opacity=".36" stroke="${paper}" stroke-opacity=".65"/><path d="M83 144h314v184H83z" fill="none" stroke="${paper}" stroke-opacity=".52"/><path d="m100 295 76-82 48 46 77-104 92 140H100z" fill="${light}" fill-opacity=".83"/><circle cx="320" cy="185" r="30" fill="${paper}" fill-opacity=".9"/><path d="M65 355h350" stroke="${paper}" stroke-width="3"/>`,
    `<path d="M240 82 275 175l98-38-46 94 96 42-102 19 20 103-76-70-76 70 20-103-102-19 96-42-46-94 98 38z" fill="${accent}" fill-opacity=".78"/><circle cx="240" cy="245" r="53" fill="${paper}" fill-opacity=".85"/><circle cx="240" cy="245" r="32" fill="${dark}"/><path d="M72 355h336" stroke="${paper}" stroke-opacity=".78" stroke-width="3"/>`
  ][variant];
  const titleMarkup = title.map((line, index) =>
    `<text x="48" y="${390 + index * 47}" fill="${paper}" font-family="Georgia,serif" font-size="${line.length > 15 ? 29 : 36}" font-weight="bold" letter-spacing="-.7">${line}</text>`
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 680">
    <defs><linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient><pattern id="grain" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 8.5h9" stroke="${paper}" stroke-opacity=".12"/></pattern></defs>
    <rect width="480" height="680" fill="url(#paper)"/><rect width="480" height="680" fill="url(#grain)"/>
    <path d="M23 22h434v636H23z" fill="none" stroke="${paper}" stroke-opacity=".48" stroke-width="2"/>
    <path d="M42 42h396v596H42z" fill="none" stroke="${accent}" stroke-opacity=".48"/>
    <text x="48" y="79" fill="${paper}" font-family="Arial,sans-serif" font-size="11" letter-spacing="3">${category}</text>
    <text x="429" y="79" fill="${paper}" font-family="Arial,sans-serif" font-size="10" text-anchor="end">№ ${String((hash % 99) + 1).padStart(2, "0")}</text>
    ${artwork}
    ${titleMarkup}
    <path d="M48 548h384" stroke="${paper}" stroke-opacity=".58"/>
    <text x="48" y="578" fill="${paper}" font-family="Arial,sans-serif" font-size="13" letter-spacing="1.5">${author.toUpperCase()}</text>
    <text x="48" y="611" fill="${paper}" fill-opacity=".76" font-family="Arial,sans-serif" font-size="9" letter-spacing="2">A READNEST ORIGINAL</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function BookCover({ book, alt = "" }) {
  const source = localBookCovers[book.title?.trim().toLowerCase()] || book.cover;
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [source]);

  return (
    <img
      src={failed || !source ? makeBookCover(book) : source}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}

function averageRating(reviews = []) {
  if (!reviews.length) return null;
  return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
}

function readSaved(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function App() {
  const [books, setBooks] = useState(() => readSaved("readnest-books"));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All books");
  const [sort, setSort] = useState("featured");
  const [favorites, setFavorites] = useState(() => readSaved("readnest-saved"));
  const [showSaved, setShowSaved] = useState(false);
  const [cart, setCart] = useState(() => readSaved("readnest-bag"));
  const [orders, setOrders] = useState(() => readSaved("readnest-orders"));
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const searchRef = useRef(null);
  const chatEndRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hi, book lover! Tell me what you’re in the mood for and I’ll find your next read."
    }
  ]);

  async function loadBooks() {
    setLoadingBooks(books.length === 0);
    try {
      const response = await fetch(`${API}/books`);
      if (!response.ok) throw new Error(`The book service returned error ${response.status}.`);
      const catalog = await response.json();
      if (!Array.isArray(catalog)) throw new Error("The book service returned an invalid catalog.");
      setBooks(catalog);
      try {
        localStorage.setItem("readnest-books", JSON.stringify(catalog));
      } catch (storageError) {
        console.warn("The catalog loaded, but this browser could not save an offline copy.", storageError);
      }
      setCatalogError("");
    } catch {
      const cachedBooks = readSaved("readnest-books");
      if (cachedBooks.length > 0) setBooks(cachedBooks);
      setCatalogError(
        cachedBooks.length > 0
          ? "The catalog server is offline. Showing the last catalog saved in this browser."
          : "The catalog server is not connected. Start the ReadNest backend on port 8080, then retry."
      );
    } finally {
      setLoadingBooks(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    localStorage.setItem("readnest-saved", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("readnest-bag", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("readnest-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    function handleShortcut(event) {
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === searchRef.current) {
        setSearch("");
        searchRef.current.blur();
      }
      if (event.key === "Escape") setSelectedBook(null);
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chatMessages]);

  const categories = useMemo(
    () => ["All books", ...new Set(books.map((book) => book.category))],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const results = books.filter((book) => {
      const text = `${book.title} ${book.author} ${book.category} ${book.description}`.toLowerCase();
      return (
        (!query || text.includes(query)) &&
        (!showSaved || favorites.includes(book.id)) &&
        (category === "All books" || book.category === category)
      );
    });

    if (sort === "price-low") return [...results].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...results].sort((a, b) => b.price - a.price);
    if (sort === "title") return [...results].sort((a, b) => a.title.localeCompare(b.title));
    return results;
  }, [books, category, favorites, search, showSaved, sort]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(book) {
    setCart((oldCart) => {
      const found = oldCart.find((item) => item.id === book.id);
      if (found) {
        return oldCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...oldCart, { ...book, quantity: 1 }];
    });
    setShowCart(true);
    setMessage(`${book.title} added to your bag.`);
    window.setTimeout(() => setMessage(""), 3000);
  }

  function changeQuantity(id, amount) {
    setCart((oldCart) =>
      oldCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + amount } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function toggleFavorite(bookId) {
    setFavorites((current) =>
      current.includes(bookId)
        ? current.filter((id) => id !== bookId)
        : [...current, bookId]
    );
  }

  function surpriseMe() {
    if (!books.length) {
      setMessage("Start the book collection to get a surprise pick.");
      return;
    }
    const book = books[Math.floor(Math.random() * books.length)];
    setSelectedBook(book);
  }

  function sendChat(event) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const normalized = text.toLowerCase();
    const priceLimitMatch = normalized.match(/(?:under|below|less than|up to|upto|budget(?: of)?|₹)\s*₹?\s*([\d,]+)/);
    const priceLimit = priceLimitMatch ? Number(priceLimitMatch[1].replaceAll(",", "")) : null;
    const genreWords = {
      mystery: ["mystery", "thriller", "detective", "crime", "page turner"],
      fiction: ["fiction", "novel", "romance", "story", "emotional"],
      "science fiction": ["science fiction", "sci-fi", "scifi", "space", "future", "fantasy"],
      science: ["science", "nature", "environment", "planet", "technology"],
      "self help": ["self help", "self-help", "inspiring", "motivation", "habits", "growth"]
    };
    const requestedGenres = Object.entries(genreWords)
      .filter(([, words]) => words.some((word) => normalized.includes(word)))
      .map(([genre]) => genre);
    const tokens = normalized.match(/[a-z0-9]+/g) || [];
    const stopWords = new Set(["book", "books", "recommend", "recommendation", "something", "want", "read", "reading", "find", "good", "like", "with", "under", "below", "less", "than", "price", "budget", "for", "the", "and"]);
    const queryTokens = tokens.filter((token) => token.length > 2 && !stopWords.has(token));
    const wantsCartHelp = /cart|bag|order|checkout|delivery|payment/.test(normalized);
    const wantsOrderHelp = /track|previous orders|past orders|order history/.test(normalized);
    const wantsAuthorInfo = /author|written by|who wrote/.test(normalized);
    const wantsReviews = /review|rating|stars|published|publication/.test(normalized);
    const canRecommend = !wantsCartHelp && !wantsOrderHelp && !wantsAuthorInfo && !wantsReviews;
    const rankedBooks = [...books]
      .filter((book) => priceLimit === null || book.price <= priceLimit)
      .map((book) => {
        const title = book.title.toLowerCase();
        const author = book.author.toLowerCase();
        const categoryName = book.category.toLowerCase();
        const description = book.description.toLowerCase();
        const tokenScore = queryTokens.reduce((score, token) => {
          if (title.includes(token)) return score + 5;
          if (author.includes(token)) return score + 4;
          if (categoryName.includes(token)) return score + 3;
          return score + (description.includes(token) ? 1 : 0);
        }, 0);
        const genreScore = requestedGenres.reduce((score, genre) => score + (categoryName === genre ? 8 : 0), 0);
        return { book, score: tokenScore + genreScore };
      })
      .sort((a, b) => b.score - a.score || a.book.price - b.book.price);
    const picks = canRecommend ? rankedBooks.slice(0, 3).map(({ book }) => book) : [];

    let reply;
    if (books.length === 0) {
      reply = "I’m still waiting for the bookshelf to load. Check that the ReadNest backend is running, then try again.";
    } else if (wantsOrderHelp) {
      reply = "Open My orders in the top bar to see saved orders and their demo tracking timeline. Live carrier updates aren’t connected yet.";
    } else if (wantsCartHelp) {
      reply = "Your bag is in the top bar. Open it to update quantities or continue to the three-step demo checkout. No payment is processed.";
    } else if (wantsAuthorInfo && rankedBooks[0]) {
      reply = `Here’s an author from our catalog. Open the book to read the author profile and previous works:`;
    } else if (wantsReviews && rankedBooks[0]) {
      reply = `Open a book’s details to see its publication date and clearly labeled sample reviews. Here’s one to explore:`;
    } else if (priceLimit !== null && picks.length === 0) {
      reply = `I couldn’t find a book under ${currency.format(priceLimit)}. Try a higher budget or ask me for a genre.`;
    } else if (picks.length > 0 && requestedGenres.length > 0) {
      reply = `Here are a few ${requestedGenres[0]} picks${priceLimit === null ? "" : ` under ${currency.format(priceLimit)}`}:`;
    } else if (picks.length > 0 && queryTokens.length > 0 && rankedBooks[0].score > 0) {
      reply = `I matched these books to what you described${priceLimit === null ? "" : ` under ${currency.format(priceLimit)}`}:`;
    } else if (picks.length > 0) {
      reply = `Here are a few reader-friendly picks${priceLimit === null ? "" : ` under ${currency.format(priceLimit)}`}:`;
    } else {
      reply = "Try asking for a genre such as mystery, science fiction, fiction, science, or self help — or give me a budget like “under ₹400”.";
    }

    setChatMessages((current) => [
      ...current,
      { role: "user", text },
      { role: "assistant", text: reply, books: canRecommend ? picks : (wantsAuthorInfo || wantsReviews ? rankedBooks.slice(0, 1).map(({ book }) => book) : []) }
    ]);
    setChatInput("");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="ReadNest home"><span className="brand-mark" aria-hidden="true">r</span><span>readnest<span className="brand-period">.</span></span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className={!showSaved ? "nav-link active" : "nav-link"} href="#collection" onClick={() => setShowSaved(false)}>Discover</a>
          <a className={showSaved ? "nav-link active" : "nav-link"} href="#collection" onClick={() => setShowSaved(true)}>Reading list <span className="nav-count">{favorites.length}</span></a>
          <a className="nav-link" href="#about">Our story</a>
        </nav>
        <label className="header-search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input ref={searchRef} aria-label="Search books, authors, or genres" placeholder="Find your next read..." value={search}
            onChange={(event) => { setSearch(event.target.value); setShowSaved(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }} />
          <kbd>/</kbd>
        </label>
        <div className="header-actions">
          <button className="saved-button" aria-label={showSaved ? "Show all books" : `Show reading list, ${favorites.length} items`} aria-pressed={showSaved}
            onClick={() => { setCategory("All books"); setSearch(""); setShowSaved((saved) => !saved); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }}>
            <span aria-hidden="true">{showSaved ? "♥" : "♡"}</span><span className="saved-label">Reading list</span><span className="saved-count">{favorites.length}</span>
          </button>
          <button className="orders-button" onClick={() => setShowOrders(true)}><span aria-hidden="true">◷</span><span>My orders</span><span className="orders-count">{orders.length}</span></button>
          <button className="bag-button" onClick={() => setShowCart(true)}><span aria-hidden="true">▱</span><span>Bag</span><span className="bag-count">{cartCount}</span></button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="live-dot" /> THE READNEST READING ROOM</div>
            <h1>Your next<br />favorite is<br /><em>closer than</em><br />you think.</h1>
            <p className="hero-description">A little less browsing. A lot more getting lost in a good story. Find the one that feels like it was written for you.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#collection">Explore the shelves <span aria-hidden="true">↗</span></a>
              <button className="surprise-button" onClick={surpriseMe}><span>✳</span> Surprise me</button>
            </div>
            <div className="hero-stats"><div><strong>{String(books.length).padStart(2, "0")}</strong><span>good stories<br />and counting</span></div><i /><div><strong>∞</strong><span>ways to find<br />your next read</span></div></div>
          </div>
          <div className="hero-visual">
            <div className="visual-glow" />
            <div className="visual-ring ring-a" /><div className="visual-ring ring-b" />
            {books[0] ? <button className="featured-cover" onClick={() => setSelectedBook(books[0])} aria-label={`Preview ${books[0].title}`}><BookCover book={books[0]} /></button> : <div className="featured-cover featured-placeholder"><span>THE<br /><em>NEXT</em><br />CHAPTER</span><small>A READNEST PICK</small></div>}
            <div className="floating-note note-top"><span className="note-icon">✳</span><div><strong>Picked for you</strong><small>Good things await</small></div></div>
            <div className="floating-note note-bottom"><span className="reader-icon">↗</span><div><strong>Find your feeling</strong><small>Browse by genre or mood</small></div></div>
            <div className="visual-index">RN — 001 <span>✳</span> CURATED WITH CARE</div>
          </div>
          <div className="hero-scroll"><span /> SCROLL TO WANDER</div>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> {showSaved ? "YOUR PERSONAL SHELF" : "THE BOOK COLLECTION"}</div>
              <h2>{showSaved ? <>Kept close for <em>later.</em></> : <>Find your next<br className="mobile-break" /> <em>rabbit hole.</em></>}</h2>
            </div>
            <p className="section-intro">Thoughtful reads for slow mornings,<br />late nights, and everything between.</p>
          </div>

          <div className="browse-bar" id="categories">
            <div className="category-list" aria-label="Filter by category">
              {categories.map((item) => (
                <button
                  className={`category-chip${category === item ? " selected" : ""}`}
                  key={item}
                  onClick={() => { setCategory(item); setShowSaved(false); }}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="browse-tools">
              <label className="sort-control"><span>Sort</span><select aria-label="Sort books" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="title">Title: A to Z</option>
              </select></label>
              <div className="view-toggle" aria-label="Book layout">
                <button aria-label="Grid view" aria-pressed={viewMode === "grid"} className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>▦</button>
                <button aria-label="List view" aria-pressed={viewMode === "list"} className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>☷</button>
              </div>
            </div>
          </div>

          {message && <div className="toast-message" role="status">{message}<button aria-label="Dismiss message" onClick={() => setMessage("")}>×</button></div>}
          {catalogError && (
            <div className="catalog-connection" role="status">
              <span aria-hidden="true">!</span>
              <p>{catalogError}</p>
              <button type="button" onClick={loadBooks} disabled={loadingBooks}>{loadingBooks ? "Connecting…" : "Retry connection"}</button>
            </div>
          )}

          {loadingBooks ? (
            <div className="loading-state"><span className="loader" /> Finding your next favorite...</div>
          ) : filteredBooks.length ? (
            <div className={`book-grid ${viewMode === "list" ? "list-view" : ""}`}>
              {filteredBooks.map((book, index) => (
                <article className="book-card" key={book.id} style={{ "--card-index": index }}>
                  <button className="cover-wrap" onClick={() => setSelectedBook(book)} aria-label={`Quick view: ${book.title}`}>
                    <BookCover book={book} alt={`Cover of ${book.title}`} />
                    <span className="cover-category">{book.category}</span>
                    <span className="cover-open">QUICK VIEW ↗</span>
                  </button>
                  <div className="book-details">
                    <div className="book-title-row"><button onClick={() => setSelectedBook(book)}>{book.title}</button><strong>{currency.format(book.price)}</strong></div>
                    <p className="book-author">by {book.author}</p>
                    <p className="book-description">{book.description}</p>
                    <div className="book-card-footer"><span className="rating">★★★★★ <span>4.9</span></span><button className="save-book" aria-label={favorites.includes(book.id) ? `Remove ${book.title} from reading list` : `Save ${book.title} to reading list`} aria-pressed={favorites.includes(book.id)} onClick={() => toggleFavorite(book.id)}>{favorites.includes(book.id) ? "♥ Saved" : "♡ Save"}</button></div>
                  </div>
                  <button className="card-add" onClick={() => addToCart(book)} aria-label={`Add ${book.title} to bag`}>+</button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">⌕</span>
              <h3>{books.length === 0 && catalogError ? "The bookshelf couldn’t connect." : showSaved && favorites.length === 0 ? "Your reading list is waiting." : "No stories found just yet."}</h3>
              <p>{books.length === 0 && catalogError ? "Start the backend from the backend folder with “mvn spring-boot:run”, then retry." : showSaved && favorites.length === 0 ? "Tap a heart on any book to keep it close." : "Try another title, author, or category."}</p>
              {books.length === 0 && catalogError
                ? <button className="text-button" onClick={loadBooks} disabled={loadingBooks}>{loadingBooks ? "Connecting…" : "Retry connection"}</button>
                : <button className="text-button" onClick={() => { setSearch(""); setCategory("All books"); setShowSaved(false); }}>Clear filters</button>}
            </div>
          )}
          <div className="collection-footer"><span>SHOWING {filteredBooks.length} OF {books.length} BOOKS</span><span>GOOD STORIES, NO GATEKEEPING <span aria-hidden="true">✳</span></span></div>
        </section>

        <section className="about-strip" id="about">
          <div className="about-top"><span className="eyebrow">THE READNEST PROMISE</span><span>01 — 03</span></div>
          <h2>Curated with care.<br /><em>Read at your pace.</em></h2>
          <p>We believe a good book can change the shape of your day. Find a story, save it for later, and let the next chapter happen when you’re ready.</p>
          <a href="#collection" className="about-link">A shelf of possibilities <span>↗</span></a>
          <span className="about-star" aria-hidden="true">✳</span>
        </section>
      </main>

      <footer className="site-footer"><a className="brand footer-brand" href="#home"><span className="brand-mark" aria-hidden="true">r</span><span>readnest<span className="brand-period">.</span></span></a><span>A good place to get lost.</span><span>© 2026 READNEST BOOKS</span></footer>

      <button className={`chat-launcher${chatOpen ? " chat-is-open" : ""}`} onClick={() => setChatOpen((open) => !open)} aria-label={chatOpen ? "Close book assistant" : "Open book assistant"}>
        <span aria-hidden="true">{chatOpen ? "×" : "✳"}</span>
        {!chatOpen && <span className="chat-launcher-label">Ask our book buddy</span>}
      </button>
      {chatOpen && (
        <section className="chat-panel" aria-label="ReadNest book buddy">
          <div className="chat-header">
            <div className="chat-avatar">r<span /></div>
            <div><strong>Your book buddy</strong><span><i /> Here to find your next read</span></div>
            <button aria-label="Close chat" onClick={() => setChatOpen(false)}>×</button>
          </div>
          <div className="chat-messages" aria-live="polite">
            <div className="chat-day">TODAY</div>
            {chatMessages.map((chat, index) => (
              <div className={`chat-message ${chat.role}`} key={`${chat.role}-${index}`}>
                <p>{chat.text}</p>
                {chat.books?.map((book) => (
                  <div className="chat-book-pick" key={`${index}-${book.id}`}>
                    <BookCover book={book} />
                    <div><strong>{book.title}</strong><span>{book.author} · {book.category}</span><b>{currency.format(book.price)}</b></div>
                    <button onClick={() => addToCart(book)} aria-label={`Add ${book.title} to bag`}>+</button>
                  </div>
                ))}
              </div>
            ))}
            <div ref={chatEndRef} />
            {chatMessages.length === 1 && <div className="chat-suggestions">{["Mystery under ₹400", "Something inspiring", "Help me track an order"].map((suggestion) => <button key={suggestion} onClick={() => { setChatInput(suggestion); }}>{suggestion} <span>↗</span></button>)}</div>}
          </div>
          <form className="chat-form" onSubmit={sendChat}>
            <input aria-label="Message your book buddy" placeholder="Tell me what you love..." value={chatInput} onChange={(event) => setChatInput(event.target.value)} />
            <button aria-label="Send message" disabled={!chatInput.trim()}>↗</button>
          </form>
          <div className="chat-footnote">Catalog-powered picks · Matched by genre, mood & budget</div>
        </section>
      )}

      {selectedBook && (
        <div className="overlay quick-view-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedBook(null); }}>
          <section className="quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
            <button className="quick-view-close" aria-label="Close book preview" onClick={() => setSelectedBook(null)}>×</button>
            <div className="quick-view-cover"><BookCover book={selectedBook} alt={`Cover of ${selectedBook.title}`} /></div>
            <div className="quick-view-info">
              <span className="eyebrow"><span className="eyebrow-line" /> {selectedBook.category}</span>
              <h2 id="quick-view-title">{selectedBook.title}</h2>
              <p className="quick-view-author">A story by {selectedBook.author}</p>
              <div className="quick-view-rating"><span>★★★★★</span> {averageRating(selectedBook.reviews) || "New"} <i /> {selectedBook.reviews?.length || 0} sample reviews</div>
              <p className="quick-view-description">{selectedBook.description}</p>
              <div className="quick-view-meta"><span>Written by <strong>{selectedBook.author}</strong></span><span>Published <strong>{displayDate(selectedBook.publishedDate)}</strong></span></div>
              <section className="author-profile">
                <div className="author-profile-heading"><span className="author-avatar">{selectedBook.author?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}</span><div><span>MEET THE AUTHOR</span><strong>{selectedBook.author}</strong></div></div>
                <p>{selectedBook.authorBio || `${selectedBook.author} is a ReadNest featured author.`}</p>
                <div className="author-works"><span>ALSO BY THIS AUTHOR</span><strong>{selectedBook.previousWorks || "More titles coming soon"}</strong></div>
                <small className="author-demo-note">Fictional author profile for this bookstore demo.</small>
              </section>
              <div className="quick-view-actions">
                <button className="primary-button" onClick={() => { addToCart(selectedBook); setSelectedBook(null); }}>Add to bag <span>{currency.format(selectedBook.price)}</span></button>
                <button className="quick-view-save" aria-pressed={favorites.includes(selectedBook.id)} onClick={() => toggleFavorite(selectedBook.id)}>{favorites.includes(selectedBook.id) ? "♥ Saved to list" : "♡ Save for later"}</button>
              </div>
              <section className="customer-reviews" aria-label="Sample customer reviews">
                <div className="reviews-heading"><h3>Readers said</h3><span>DEMO SAMPLE REVIEWS</span></div>
                {selectedBook.reviews?.length ? selectedBook.reviews.map((review, index) => (
                  <article className="customer-review" key={`${review.customerName}-${index}`}>
                    <div className="review-byline"><strong>{review.customerName}</strong><span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div>
                    <p>{review.comment}</p>
                    <time dateTime={review.reviewDate}>{displayDate(review.reviewDate)}</time>
                  </article>
                )) : <p className="no-reviews">No reviews yet. Be the first to share what you think.</p>}
              </section>
            </div>
          </section>
        </div>
      )}

      {showCart && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCart(false); }}>
          <aside className="cart-drawer" aria-label="Your shopping bag">
            <div className="panel-head"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Your bag <span>({cartCount})</span></h2></div><button className="close-button" aria-label="Close bag" onClick={() => setShowCart(false)}>×</button></div>
            {cart.length === 0 ? (
              <div className="cart-empty"><span aria-hidden="true">♡</span><h3>Your bag is taking a little nap.</h3><p>Find a story that feels like you.</p><button className="primary-button" onClick={() => { setShowCart(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }}>Explore books <span>↗</span></button></div>
            ) : (
              <>
                <div className="cart-items">{cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <BookCover book={item} />
                    <div className="cart-item-info"><strong>{item.title}</strong><span>{item.author}</span><b>{currency.format(item.price)}</b>
                      <div className="quantity-control"><button aria-label={`Remove one ${item.title}`} onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button aria-label={`Add one ${item.title}`} onClick={() => changeQuantity(item.id, 1)}>+</button></div>
                    </div>
                  </div>
                ))}</div>
                <div className="cart-summary"><div><span>Subtotal</span><strong>{currency.format(total)}</strong></div><p>Shipping is on us for every order.</p><button className="primary-button" onClick={() => { setShowCart(false); setShowCheckout(true); }}>Continue to checkout <span>↗</span></button></div>
                <button className="keep-exploring" onClick={() => { setShowCart(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }}>← Keep exploring books</button>
              </>
            )}
          </aside>
        </div>
      )}

      {showOrders && (
        <div className="overlay orders-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowOrders(false); }}>
          <section className="orders-panel" role="dialog" aria-modal="true" aria-labelledby="orders-title">
            <div className="panel-head"><div><span className="eyebrow">YOUR READNEST HISTORY</span><h2 id="orders-title">Past orders <span>({orders.length})</span></h2></div><button className="close-button" aria-label="Close orders" onClick={() => { setShowOrders(false); setTrackingOrder(null); }}>×</button></div>
            {trackingOrder ? (
              <div className="tracking-view">
                <button className="tracking-back" onClick={() => setTrackingOrder(null)}>← All orders</button>
                <div className="tracking-reference"><span>TRACKING REFERENCE</span><strong>{trackingOrder.reference}</strong></div>
                <h3>Your story is getting ready.</h3>
                <p className="tracking-address">{trackingOrder.name} · {trackingOrder.address}</p>
                <div className="tracking-timeline">
                  <div className="tracking-step done"><span>✓</span><div><strong>Order received</strong><small>{displayDate(trackingOrder.createdAt?.slice(0, 10))}</small></div></div>
                  <div className="tracking-step current"><span>2</span><div><strong>Preparing your books</strong><small>Demo status · Awaiting fulfilment connection</small></div></div>
                  <div className="tracking-step"><span>3</span><div><strong>On the way</strong><small>Carrier tracking is not connected</small></div></div>
                  <div className="tracking-step"><span>4</span><div><strong>Delivered</strong><small>Demo tracking only</small></div></div>
                </div>
                <p className="tracking-disclaimer">This is a saved demo order. Live carrier updates require a shipping provider integration.</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="orders-empty"><span>◷</span><h3>Your next favorite is still out there.</h3><p>Completed orders from this browser will appear here.</p><button className="primary-button" onClick={() => { setShowOrders(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }}>Explore books <span>↗</span></button></div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <article className="past-order" key={order.reference}>
                    <div className="past-order-head"><div><span>ORDER {order.reference}</span><small>{displayDate(order.createdAt?.slice(0, 10))}</small></div><strong>{currency.format(order.total)}</strong></div>
                    <div className="past-order-books">{order.items.map((item) => <span key={`${order.reference}-${item.id}`}>{item.title} <i>× {item.quantity}</i></span>)}</div>
                    <div className="past-order-foot"><span>{order.paymentMethodLabel} · Demo order</span><button onClick={() => setTrackingOrder(order)}>Track order <span>↗</span></button></div>
                  </article>
                ))}
                <p className="orders-storage-note">Order history is saved in this browser only. No payment was processed.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {showCheckout && (
        <Checkout
          cart={cart}
          total={total}
          onClose={() => setShowCheckout(false)}
          onDone={(order) => {
            setOrders((current) => [order, ...current]);
            setCart([]);
            setShowCheckout(false);
            setMessage("Your order is in! Thanks for reading with us.");
          }}
        />
      )}
    </div>
  );
}

function Checkout({ cart, total, onClose, onDone }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [paymentInstrument, setPaymentInstrument] = useState("Visa");
  const [orderReference, setOrderReference] = useState("");
  const [savedLocally, setSavedLocally] = useState(false);
  const paymentMethods = [
    { id: "credit-card", label: "Credit card", description: "Choose a card network · Demo selection", icon: "▣" },
    { id: "debit-card", label: "Debit card", description: "Choose a card network · Demo selection", icon: "▤" },
    { id: "upi", label: "UPI", description: "Choose your UPI app · Demo selection", icon: "⌁" },
    { id: "net-banking", label: "Net banking", description: "Choose a bank · Demo selection", icon: "⌂" },
    { id: "cod", label: "Cash on delivery", description: "Pay the courier when your order arrives", icon: "₹" }
  ];
  const paymentOptionsByMethod = {
    "credit-card": ["Visa", "Mastercard", "RuPay", "American Express"],
    "debit-card": ["Visa", "Mastercard", "RuPay", "Maestro"],
    upi: ["Google Pay", "PhonePe", "Paytm", "BHIM UPI"],
    "net-banking": ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank"]
  };
  const instrumentOptions = paymentOptionsByMethod[paymentMethod] || [];
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === paymentMethod);
  const paymentChoiceLabel = instrumentOptions.length
    ? `${selectedPaymentMethod?.label} · ${paymentInstrument}`
    : selectedPaymentMethod?.label;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const steps = ["delivery", "payment", "review"];
  const stepIndex = steps.indexOf(step);

  function finishWithLocalDemoOrder() {
    const localReference = `RN-DEMO-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    setOrderReference(localReference);
    setSavedLocally(true);
    setStep("complete");
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setError("");

    if (step === "delivery") {
      if (!name.trim() || !address.trim()) {
        setError("Enter your name and delivery address before continuing.");
        return;
      }
      setStep("payment");
      return;
    }
    if (step === "payment") {
      setStep("review");
      return;
    }
    if (step !== "review") return;

    setLoading(true);

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          address: address.trim(),
          paymentMethod: paymentChoiceLabel,
          items: cart.map((item) => ({ bookId: item.id, quantity: item.quantity }))
        })
      });
      if (!response.ok && response.status >= 500) {
        finishWithLocalDemoOrder();
        return;
      }
      if (!response.ok) throw new Error(`We couldn’t place your order (server error ${response.status}). Please review your details and try again.`);
      const reference = (await response.text()).trim();
      if (!reference) throw new Error("The order service returned no confirmation. Please contact the shop before retrying.");
      setOrderReference(reference);
      setStep("complete");
    } catch (requestError) {
      const cannotReachServer = requestError instanceof TypeError || /failed to fetch|networkerror/i.test(requestError.message || "");
      if (cannotReachServer) {
        finishWithLocalDemoOrder();
      } else {
        setError(requestError.message || "We couldn’t place your order. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay checkout-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className={`checkout-panel checkout-step-${step}`} onSubmit={handleCheckout}>
        {step !== "complete" ? (
          <>
            <div className="panel-head"><div><span className="eyebrow">YOUR READNEST CHECKOUT</span><h2>{step === "delivery" ? "First, the delivery." : step === "payment" ? "Choose how to pay." : "Ready for a good story?"}</h2></div><button type="button" className="close-button" aria-label="Close checkout" onClick={onClose}>×</button></div>
            <div className="checkout-progress" aria-label={`Checkout step ${stepIndex + 1} of 3`}>
              {["Delivery", "Payment", "Review"].map((label, index) => (
                <div className={`progress-step${index <= stepIndex ? " completed" : ""}${index === stepIndex ? " current" : ""}`} key={label}>
                  <span>{index < stepIndex ? "✓" : `0${index + 1}`}</span><small>{label}</small>
                </div>
              ))}
            </div>
            {step === "delivery" && (
              <div className="checkout-step-content">
                <p className="checkout-intro">Where should your new stories find you?</p>
                <label htmlFor="checkout-name">Your name</label>
                <input id="checkout-name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="The name on your bookshelf" />
                <label htmlFor="checkout-address">Delivery address</label>
                <textarea id="checkout-address" autoComplete="street-address" required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Where the books should find you" />
              </div>
            )}
            {step === "payment" && (
              <div className="checkout-step-content payment-layout">
                <section className="payment-choice-column" aria-labelledby="payment-method-heading">
                  <div className="payment-section-heading">
                    <span className="payment-step-icon" aria-hidden="true">⌁</span>
                    <div><h3 id="payment-method-heading">Select a payment method</h3><p>Choose how you’d like to pay for your books.</p></div>
                  </div>
                  <div className="payment-options">
                    {paymentMethods.map((method) => (
                      <label className={`payment-option${paymentMethod === method.id ? " selected" : ""}`} key={method.id}>
                        <input type="radio" name="payment" value={method.id} required checked={paymentMethod === method.id} onChange={() => {
                          setPaymentMethod(method.id);
                          setPaymentInstrument(paymentOptionsByMethod[method.id]?.[0] || "");
                        }} />
                        <span className="payment-icon" aria-hidden="true">{method.icon}</span>
                        <span className="payment-copy"><strong>{method.label}</strong><small>{method.description}</small></span>
                        <span className="radio-indicator" aria-hidden="true" />
                      </label>
                    ))}
                  </div>
                  {instrumentOptions.length > 0 ? (
                    <fieldset className="payment-sub-options">
                      <legend>{paymentMethod === "upi" ? "Choose a UPI app" : paymentMethod === "net-banking" ? "Choose your bank" : "Choose a card network"}</legend>
                      <div>
                        {instrumentOptions.map((option) => (
                          <label className={`payment-sub-option${paymentInstrument === option ? " selected" : ""}`} key={option}>
                            <input type="radio" name="payment-instrument" value={option} required checked={paymentInstrument === option} onChange={() => setPaymentInstrument(option)} />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ) : (
                    <div className="cod-explainer"><span aria-hidden="true">₹</span><p>Pay the courier when your books arrive. In this demo, the selection is saved with your order; no collection is arranged.</p></div>
                  )}
                  <div className="demo-payment-notice"><span aria-hidden="true">i</span><p><strong>Demo checkout</strong> · No payment provider is connected. Don’t enter card numbers, UPI IDs, PINs, or banking credentials. This selection won’t charge you.</p></div>
                </section>
                <aside className="payment-order-summary" aria-label="Order summary">
                  <div className="payment-summary-heading"><span>YOUR ORDER</span><strong>{itemCount} {itemCount === 1 ? "book" : "books"}</strong></div>
                  <div className="payment-summary-items">
                    {cart.map((item) => (
                      <div className="payment-summary-item" key={item.id}>
                        <BookCover book={item} alt="" />
                        <div><strong>{item.title}</strong><span>Qty {item.quantity}</span></div>
                        <b>{currency.format(item.price * item.quantity)}</b>
                      </div>
                    ))}
                  </div>
                  <div className="payment-summary-line"><span>Subtotal</span><strong>{currency.format(total)}</strong></div>
                  <div className="payment-summary-line"><span>Shipping</span><strong className="shipping-included">Free</strong></div>
                  <div className="payment-summary-total"><span>Total</span><strong>{currency.format(total)}</strong></div>
                  <div className="payment-summary-selected"><span>Selected</span><strong>{paymentChoiceLabel}</strong></div>
                  <div className="payment-summary-safe"><span aria-hidden="true">✓</span><p>Your selection can be changed before you place the demo order.</p></div>
                </aside>
              </div>
            )}
            {step === "review" && (
              <div className="checkout-step-content">
                <p className="checkout-intro">Take one last look before placing your demo order.</p>
                <div className="review-card">
                  <span>DELIVER TO</span><strong>{name}</strong><p>{address}</p>
                  <button type="button" onClick={() => setStep("delivery")}>Edit delivery</button>
                </div>
                <div className="review-card payment-review">
                  <span>PAYMENT PREFERENCE</span><strong>{paymentChoiceLabel}</strong>
                  <p>{paymentMethod === "cod" ? "Cash on delivery selected · Demo only" : "Gateway is not connected · No payment will be processed"}</p>
                  <button type="button" onClick={() => setStep("payment")}>Change</button>
                </div>
                <div className="review-items">{cart.map((item) => <div key={item.id}><span>{item.title} <i>× {item.quantity}</i></span><strong>{currency.format(item.price * item.quantity)}</strong></div>)}</div>
              </div>
            )}
            {step !== "payment" && <div className="checkout-total"><span>{itemCount} lovely read{itemCount === 1 ? "" : "s"} <small>· Shipping on us</small></span><strong>{currency.format(total)}</strong></div>}
            {error && <p className="checkout-error" role="alert">{error}</p>}
            <div className="checkout-navigation">
              {step !== "delivery" ? <button className="checkout-back" type="button" onClick={() => setStep(step === "review" ? "payment" : "delivery")}>← Back</button> : <span className="checkout-secure">✳ Demo checkout</span>}
              <button className="primary-button checkout-submit" disabled={loading}>{loading ? <><span className="checkout-spinner" /> Placing order...</> : step === "review" ? <>Place demo order <span>↗</span></> : <>Continue <span>↗</span></>}</button>
            </div>
            <p className="checkout-note">Demo only · No real payment will be taken.</p>
          </>
        ) : (
          <div className="order-success" role="status">
            <div className="success-icon"><span>✓</span></div>
            <span className="eyebrow">A NEW CHAPTER BEGINS</span>
            <h2>Your order is<br /><em>all set.</em></h2>
            <p>Thanks, {name.trim()}. Your demo order has been recorded. We’re so glad these stories found their way to you.</p>
            <div className="success-reference"><span>ORDER REFERENCE</span><strong>{orderReference}</strong></div>
            <div className="success-payment">{selectedPaymentMethod?.label} <span>·</span> Demo order, no payment processed</div>
            <p className="success-storage-note">
              {savedLocally
                ? "The order server was unavailable, so this demo order is saved in this browser only."
                : "This demo order will appear in My orders in this browser."}
            </p>
            <button
              type="button"
              className="primary-button success-done"
              onClick={() => onDone({
                reference: orderReference,
                name: name.trim(),
                address: address.trim(),
                items: cart.map((item) => ({ ...item })),
                total,
                paymentMethod,
                paymentMethodLabel: paymentChoiceLabel || "Demo payment",
                createdAt: new Date().toISOString()
              })}
            >Back to the shelves <span>↗</span></button>
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
