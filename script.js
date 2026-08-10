/* =========================================================
   script.js
   Adds interactivity to the site: image slider, gallery
   lightbox, clickable pagination, nav highlighting, a
   search box, scroll animations, a back-to-top button and
   simple login form validation.

   HOW TO USE:
   Add this one line just before the closing </body> tag of
   every .html page you want it on:

       <script src="script.js"></script>

   Everything else (styles this script needs, like the
   lightbox overlay or the fade-in animation) is injected
   automatically below, so you don't have to touch style.css.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  injectHelperStyles();
  highlightActiveNavLink();
  initDynamicBackground();
  initHeroSlider();
  initGalleryLightbox();
  initPagination();
  initSearchBox();
  initScrollReveal();
  initBackToTop();
  initLoginForm();
});

/* ---------------------------------------------------------
   0. Inject the small amount of CSS the features below need
   --------------------------------------------------------- */
function injectHelperStyles() {
  const css = `
    #nav ul li a.active-page {
      color: white;
      background-color: lightgreen;
    }

    #slider {
      transition: opacity 0.6s ease-in-out;
    }
    #slider.fading {
      opacity: 0.2;
    }

    .gallery img {
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .gallery img:hover {
      transform: scale(1.08);
    }

    #lightbox-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      cursor: zoom-out;
      animation: fadeIn 0.25s ease;
    }
    #lightbox-overlay img {
      max-width: 85%;
      max-height: 85%;
      border: 4px solid white;
      border-radius: 6px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .baby {
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .baby:hover {
      background-color: lightgreen;
      color: white;
    }

    #search {
      transition: width 0.3s ease, box-shadow 0.3s ease;
    }
    #search:focus {
      width: 160px;
      outline: none;
      box-shadow: 0 0 5px lightgreen;
    }

    mark.search-hit {
      background-color: lightgreen;
      color: white;
      border-radius: 3px;
    }

    .shake {
      animation: shake 0.4s ease;
    }

    #left, #right, .footer_one {
      opacity: 0;
      transform: translateY(25px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    #left.revealed, #right.revealed, .footer_one.revealed {
      opacity: 1;
      transform: translateY(0);
    }

    #back-to-top {
      position: fixed;
      bottom: 25px;
      right: 25px;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background-color: green;
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
      display: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 999;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }
    #back-to-top:hover {
      background-color: lightgreen;
      transform: translateY(-3px);
    }

    .form-message {
      font-size: 13px;
      margin-top: 4px;
      display: block;
    }
    .form-message.error { color: #d9534f; }
    .form-message.success { color: green; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }

    /* Animated gradient replacing the flat green body background */
    body {
      background: linear-gradient(-45deg, #145214, #1f7a1f, #2e8b2e, #3cb371, #1f7a1f);
      background-size: 400% 400%;
      animation: gradientShift 18s ease infinite;
    }
    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Soft floating blobs that drift behind the page content */
    .bg-blob {
      position: fixed;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.35;
      pointer-events: none;
      z-index: 0;
    }
    #outer {
      position: relative;
      z-index: 1;
    }
    @keyframes drift1 {
      0%   { transform: translate(0, 0); }
      50%  { transform: translate(120px, 80px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes drift2 {
      0%   { transform: translate(0, 0); }
      50%  { transform: translate(-100px, 100px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes drift3 {
      0%   { transform: translate(0, 0); }
      50%  { transform: translate(90px, -90px); }
      100% { transform: translate(0, 0); }
    }
  `;
  const styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);
}

/* ---------------------------------------------------------
   0b. Add a few large, blurred, softly-drifting circles
       behind the content so the green background isn't flat
   --------------------------------------------------------- */
function initDynamicBackground() {
  const blobs = [
    { size: 400, top: "-10%", left: "5%", color: "#a8e6a1", anim: "drift1 22s ease-in-out infinite" },
    { size: 300, top: "50%", left: "80%", color: "#6fcf6f", anim: "drift2 26s ease-in-out infinite" },
    { size: 250, top: "80%", left: "10%", color: "#c8f2c0", anim: "drift3 20s ease-in-out infinite" }
  ];

  blobs.forEach(function (b) {
    const blob = document.createElement("div");
    blob.className = "bg-blob";
    blob.style.width = b.size + "px";
    blob.style.height = b.size + "px";
    blob.style.top = b.top;
    blob.style.left = b.left;
    blob.style.backgroundColor = b.color;
    blob.style.animation = b.anim;
    document.body.appendChild(blob);
  });
}

/* ---------------------------------------------------------
   1. Highlight the current page's link in the nav bar
   --------------------------------------------------------- */
function highlightActiveNavLink() {
  const links = document.querySelectorAll("#nav ul li a");
  const currentPage = location.pathname.split("/").pop() || "index.html";

  links.forEach(function (link) {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active-page");
    }
  });
}

/* ---------------------------------------------------------
   2. Auto-rotate the hero/banner image inside #slider
   --------------------------------------------------------- */
function initHeroSlider() {
  const slider = document.getElementById("slider");
  if (!slider) return;

  const images = ["sofa.png", "GIP.jpg", "GIP2.jpg", "GIP3.jpg", "GIP4.jpg", "GIP5.jpg"];
  let index = 0;
  let timer = setInterval(nextSlide, 4000);

  function nextSlide() {
    index = (index + 1) % images.length;
    slider.classList.add("fading");
    setTimeout(function () {
      slider.style.backgroundImage = "url('" + images[index] + "')";
      slider.classList.remove("fading");
    }, 300);
  }

  // Pause the rotation while the user is hovering over it
  slider.addEventListener("mouseenter", function () {
    clearInterval(timer);
  });
  slider.addEventListener("mouseleave", function () {
    timer = setInterval(nextSlide, 4000);
  });
}

/* ---------------------------------------------------------
   3. Click a gallery thumbnail to view it full-size
   --------------------------------------------------------- */
function initGalleryLightbox() {
  const thumbs = document.querySelectorAll(".gallery img");
  if (!thumbs.length) return;

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      const overlay = document.createElement("div");
      overlay.id = "lightbox-overlay";

      const bigImg = document.createElement("img");
      bigImg.src = thumb.src;

      overlay.appendChild(bigImg);
      document.body.appendChild(overlay);

      overlay.addEventListener("click", function () {
        overlay.remove();
      });
    });
  });

  // Let the Escape key close the lightbox too
  document.addEventListener("keydown", function (e) {
    const overlay = document.getElementById("lightbox-overlay");
    if (overlay && e.key === "Escape") overlay.remove();
  });
}

/* ---------------------------------------------------------
   4. Make the "1 2 3" pagination boxes clickable
   --------------------------------------------------------- */
function initPagination() {
  const pages = document.querySelectorAll(".baby");
  const pageLabel = document.getElementById("pgleft");
  if (!pages.length) return;

  pages.forEach(function (page) {
    page.addEventListener("click", function () {
      pages.forEach(function (p) {
        p.style.backgroundColor = "";
        p.style.color = "";
      });
      page.style.backgroundColor = "green";
      page.style.color = "white";

      if (pageLabel) {
        pageLabel.textContent = "Page " + page.textContent.trim() + " of " + pages.length;
      }
    });
  });
}

/* ---------------------------------------------------------
   5. Give the search box some real behaviour:
      pressing Enter looks for and highlights matching text
      inside the main article column (#left)
   --------------------------------------------------------- */
function initSearchBox() {
  const search = document.getElementById("search");
  const container = document.getElementById("left");
  if (!search || !container) return;

  search.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    // Clear any previous highlights first
    container.querySelectorAll("mark.search-hit").forEach(function (mark) {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });

    const term = search.value.trim();
    if (!term) return;

    const found = highlightTextInElement(container, term);

    if (found) {
      found.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      search.classList.add("shake");
      setTimeout(function () {
        search.classList.remove("shake");
      }, 400);
    }
  });
}

// Walks the text nodes of `element` and wraps the first case-insensitive
// match of `term` in a <mark>. Returns the <mark> element, or null.
function highlightTextInElement(element, term) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  const lowerTerm = term.toLowerCase();
  let node;

  while ((node = walker.nextNode())) {
    const text = node.nodeValue;
    const idx = text.toLowerCase().indexOf(lowerTerm);
    if (idx === -1) continue;

    const range = document.createRange();
    range.setStart(node, idx);
    range.setEnd(node, idx + term.length);

    const mark = document.createElement("mark");
    mark.className = "search-hit";
    range.surroundContents(mark);
    return mark;
  }
  return null;
}

/* ---------------------------------------------------------
   6. Fade sections in as they scroll into view
   --------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll("#left, #right, .footer_one");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (t) {
      t.classList.add("revealed");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach(function (t) {
    observer.observe(t);
  });
}

/* ---------------------------------------------------------
   7. A "back to top" button that appears once you scroll down
   --------------------------------------------------------- */
function initBackToTop() {
  const button = document.createElement("button");
  button.id = "back-to-top";
  button.textContent = "↑";
  button.title = "Back to top";
  document.body.appendChild(button);

  window.addEventListener("scroll", function () {
    button.style.display = window.scrollY > 300 ? "block" : "none";
  });

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------------------------------------------------------
   8. Simple front-end validation for the login form
   --------------------------------------------------------- */
function initLoginForm() {
  const email = document.getElementById("op");
  const password = document.getElementById("po");
  const submit = document.getElementById("submit");
  if (!email || !password || !submit) return;

  submit.addEventListener("click", function (e) {
    e.preventDefault();
    clearMessage(email);
    clearMessage(password);

    let valid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.value.trim())) {
      showMessage(email, "Please enter a valid email address.", "error");
      valid = false;
    }
    if (password.value.trim().length < 6) {
      showMessage(password, "Password should be at least 6 characters.", "error");
      valid = false;
    }

    if (valid) {
      showMessage(password, "Looks good! (No backend is connected yet.)", "success");
    }
  });
}

function showMessage(input, text, type) {
  clearMessage(input);
  const msg = document.createElement("span");
  msg.className = "form-message " + type;
  msg.textContent = text;
  input.insertAdjacentElement("afterend", msg);
}

function clearMessage(input) {
  const next = input.nextElementSibling;
  if (next && next.classList.contains("form-message")) {
    next.remove();
  }
}
