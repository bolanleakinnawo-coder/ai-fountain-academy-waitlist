/* AI Fountain Academy waitlist: links, course cards and animations. */
(function () {
  "use strict";

  // The WhatsApp group is the waitlist. Change it here and every button updates.
  var WHATSAPP_URL = "https://chat.whatsapp.com/B5nIXVyQh3kKhEW8HCxGxV?mode=gi_t";

  var COURSES = [
    { slug: "swap-faces-live-calls", title: "Swap Faces on Live Calls. Change Voices. Create Magic.", category: "AI Video & Voice",
      text: "Set up real-time face swapping and voice changing for live calls, streams and content, step by step on your own computer.", hot: true },
    { slug: "ai-digital-product-blueprint", title: "AI Digital Product Blueprint", category: "Digital Products",
      text: "Create, package and sell digital products with AI, from idea to first sale." },
    { slug: "ai-faceless-youtube-business", title: "AI Faceless YouTube Business", category: "Content Creation",
      text: "Build a YouTube channel with AI scripts, voiceovers and visuals, no camera or face required." },
    { slug: "ai-for-business-and-marketing", title: "AI for Business and Marketing", category: "Marketing",
      text: "Create ad videos, build product funnels and automate the repetitive parts of selling with AI." },
    { slug: "ai-trading-for-beginners", title: "AI Trading for Beginners", category: "Trading",
      text: "Learn trading fundamentals and how to use AI tools for research, analysis and discipline." },
    { slug: "ai-saas-business-blueprint", title: "AI SaaS Business Blueprint", category: "Software Business",
      text: "Turn AI software into a subscription business: idea, build, pricing and your first customers." }
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Course cards ---------- */
  function renderCourses() {
    var grid = $("#course-grid");
    if (!grid) return;
    grid.innerHTML = COURSES.map(function (c, i) {
      var n = String(i + 1).padStart(2, "0");
      return '<article class="course" data-reveal style="--d:' + (i % 3) * 0.08 + 's">' +
        '<div class="course-thumb">' +
          '<img src="assets/img/thumbs/' + c.slug + '.png" alt="' + esc(c.title) + ' course thumbnail" loading="lazy" width="1280" height="720">' +
          (c.hot ? '<span class="course-badge hot"><span class="live-dot red"></span>Hot course</span>' : "") +
        "</div>" +
        '<div class="course-body">' +
          '<div class="course-meta"><span>' + esc(c.category) + '</span><span class="n">' + n + " / 06</span></div>" +
          "<h3>" + esc(c.title) + "</h3>" +
          "<p>" + esc(c.text) + "</p>" +
          '<div class="course-foot"><span class="soon"><i></i>Opening soon</span>' +
          '<a class="js-join" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener">Notify me →</a></div>' +
        "</div>" +
      "</article>";
    }).join("");
  }

  /* ---------- Join links ---------- */
  function wireJoinLinks() {
    $$(".js-join").forEach(function (a) {
      a.href = WHATSAPP_URL;
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---------- Text animations ---------- */
  function splitWords(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span");
            w.className = "w";
            var inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--i", i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("no-split")) {
          walk(child);
        }
      });
    })(el);
    el.classList.add("split");
  }

  function scramble(el) {
    var final = el.getAttribute("data-text") || el.textContent;
    el.setAttribute("data-text", final);
    if (reduceMotion) { el.textContent = final; return; }
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_";
    var frame = 0, total = 24;
    (function tick() {
      var p = frame / total;
      el.textContent = final.split("").map(function (c, idx) {
        if (c === " " || idx / final.length < p) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      if (frame++ < total) requestAnimationFrame(tick);
      else el.textContent = final;
    })();
  }

  function rotateWords(el) {
    var words = el.getAttribute("data-rotate").split("|");
    el.classList.add("rotator");
    el.innerHTML = words.map(function (w, i) { return '<span class="rw' + (i === 0 ? " on" : "") + '">' + esc(w) + "</span>"; }).join("");
    var items = Array.prototype.slice.call(el.children);
    var current = function () { return items.filter(function (x) { return x.classList.contains("on"); })[0]; };
    var size = function () { el.style.width = current().offsetWidth + "px"; };
    size();
    window.addEventListener("resize", size);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
    if (reduceMotion || words.length < 2) return;
    var i = 0;
    setInterval(function () {
      var cur = items[i];
      i = (i + 1) % items.length;
      var next = items[i];
      cur.classList.remove("on"); cur.classList.add("off");
      next.classList.remove("off"); next.classList.add("on");
      el.style.width = next.offsetWidth + "px";
      setTimeout(function () { cur.classList.remove("off"); }, 700);
    }, 2400);
  }

  function observeReveals() {
    var targets = $$("[data-reveal], [data-split], [data-scramble]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        if (e.target.hasAttribute("data-scramble")) scramble(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero parallax (pointer devices only) ---------- */
  function parallax() {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var stage = $(".hero");
    var layers = $$("[data-tilt]");
    if (!stage || !layers.length) return;
    var raf = 0;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        layers.forEach(function (l) {
          var k = parseFloat(l.getAttribute("data-tilt")) * 14;
          l.style.transform = "translate3d(" + (x * k) + "px," + (y * k) + "px,0)";
        });
      });
    });
    stage.addEventListener("pointerleave", function () {
      layers.forEach(function (l) { l.style.transform = ""; });
    });
  }

  /* ---------- Nav border + mobile sticky CTA ---------- */
  function scrollUi() {
    var nav = $("#nav");
    var sticky = $("#sticky-cta");
    var heroCtas = $(".hero .ctas");
    var finalCard = $(".final-card");
    var heroGone = false, finalVisible = false;
    var update = function () {
      nav.classList.toggle("scrolled", window.scrollY > 8);
      sticky.classList.toggle("show", heroGone && !finalVisible);
    };
    window.addEventListener("scroll", update, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { heroGone = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; update(); }).observe(heroCtas);
      new IntersectionObserver(function (es) { finalVisible = es[0].isIntersecting; update(); }).observe(finalCard);
    }
    update();
  }

  /* ---------- Preview video ---------- */
  function videoPreview() {
    var card = $("#video-card"), preview = $("#preview");
    var box = $("#lightbox"), full = $("#lb-video"), close = $("#lb-close");
    if (!card) return;

    // Play the muted loop only while it's on screen.
    if (!reduceMotion && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { var p = preview.play(); if (p && p.catch) p.catch(function () {}); }
        else preview.pause();
      }, { threshold: 0.4 }).observe(card);
    }

    var lastFocus;
    var open = function () {
      lastFocus = document.activeElement;
      box.hidden = false;
      requestAnimationFrame(function () { box.classList.add("open"); });
      document.body.style.overflow = "hidden";
      full.currentTime = 0;
      full.muted = false;
      var p = full.play(); if (p && p.catch) p.catch(function () {});
      close.focus();
    };
    var shut = function () {
      box.classList.remove("open");
      full.pause();
      document.body.style.overflow = "";
      setTimeout(function () { box.hidden = true; }, 300);
      if (lastFocus) lastFocus.focus();
    };
    card.addEventListener("click", open);
    close.addEventListener("click", shut);
    box.addEventListener("click", function (e) { if (e.target === box) shut(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) shut(); });
  }

  /* ---------- Start ---------- */
  renderCourses();
  wireJoinLinks();
  $$("[data-split]").forEach(splitWords);
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
  scrollUi();
  parallax();
  videoPreview();

  var started = false;
  function start() {
    if (started) return;
    started = true;
    var loader = $(".loader");
    if (loader) loader.classList.add("done");
    $$("[data-rotate]").forEach(rotateWords);
    observeReveals();
  }
  // Short intro, then reveal the page. Never hold it for more than ~1.6s.
  if (reduceMotion) start();
  else {
    window.addEventListener("load", function () { setTimeout(start, 500); });
    setTimeout(start, 1600);
  }
})();
