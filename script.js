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
      return '<article class="course" id="course-' + c.slug + '" data-reveal style="--d:' + (i % 3) * 0.08 + 's">' +
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


  /* ---------- Hero deck: swipe, drag, arrows, auto-play ---------- */
  function heroDeck() {
    var stage = $("#deck-stage");
    if (!stage) return;
    var titleEl = $("#deck-title"), numEl = $("#deck-num"), dotsEl = $("#deck-dots");
    var cards = COURSES.map(function (c, i) {
      var el = document.createElement("div");
      el.className = "deck-card";
      el.innerHTML = '<img src="assets/img/thumbs/' + c.slug + '.png" alt="" draggable="false">';
      el.setAttribute("aria-hidden", "true");
      stage.insertBefore(el, stage.firstChild);
      return el;
    });
    dotsEl.innerHTML = COURSES.map(function (c, i) {
      return '<button aria-label="Show course ' + (i + 1) + ": " + esc(c.title) + '"></button>';
    }).join("");
    var dots = $$("button", dotsEl);
    var index = 0, busy = false, timer = 0, touched = false;

    // Places each card in the stack. `skip` is a card mid-animation that keeps its own spot.
    function layout(skip, quiet) {
      cards.forEach(function (el, i) {
        if (el === skip) return;
        var pos = (i - index + cards.length) % cards.length;
        el.setAttribute("data-pos", pos < 3 ? pos : "hidden");
      });
      if (quiet) return;
      dots.forEach(function (d, i) { d.classList.toggle("on", i === index); });
      numEl.textContent = String(index + 1).padStart(2, "0");
      titleEl.classList.add("swap");
      setTimeout(function () { titleEl.textContent = COURSES[index].title; titleEl.classList.remove("swap"); }, 180);
    }

    // Front card flies off to one side, then tucks in at the back.
    function next(dir) {
      if (busy) return;
      busy = true;
      var front = cards[index];
      front.classList.remove("dragging", "nudge");
      front.style.transform = "translate(" + (dir < 0 ? -130 : 130) + "%, 8%) rotate(" + (dir < 0 ? -14 : 14) + "deg)";
      front.style.opacity = "0";
      index = (index + 1) % cards.length;
      layout(front);
      setTimeout(function () {
        front.classList.add("instant");
        front.style.transform = ""; front.style.opacity = "";
        front.setAttribute("data-pos", "hidden");
        void front.offsetWidth;
        front.classList.remove("instant");
        layout(null, true);
        busy = false;
      }, 420);
    }
    // The previous card slides in from the left onto the front.
    function prev() {
      if (busy) return;
      busy = true;
      index = (index - 1 + cards.length) % cards.length;
      var incoming = cards[index];
      incoming.classList.add("instant");
      incoming.setAttribute("data-pos", "0");
      incoming.style.transform = "translate(-130%, 8%) rotate(-14deg)";
      incoming.style.opacity = "0";
      void incoming.offsetWidth;
      incoming.classList.remove("instant");
      incoming.style.transform = ""; incoming.style.opacity = "";
      layout();
      setTimeout(function () { busy = false; }, 420);
    }

    function goTo(target) {
      if (target === index || busy) return;
      index = target;
      layout();
    }

    function stopAuto() { clearInterval(timer); timer = 0; }
    function startAuto() {
      if (reduceMotion || touched) return;
      stopAuto();
      timer = setInterval(function () { next(-1); }, 3800);
    }
    function userAction() { touched = true; stopAuto(); var h = $(".deck-hint"); if (h) h.style.opacity = "0"; }

    $("#deck-next").addEventListener("click", function () { userAction(); next(-1); });
    $("#deck-prev").addEventListener("click", function () { userAction(); prev(); });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { userAction(); goTo(i); }); });
    $("#deck").addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { userAction(); next(-1); }
      if (e.key === "ArrowLeft") { userAction(); prev(); }
    });

    // Drag or swipe the front card.
    var startX = 0, startY = 0, dx = 0, dragging = false, decided = false, pid = null;
    stage.addEventListener("pointerdown", function (e) {
      var front = cards[index];
      if (busy || !front.contains(e.target) || (e.pointerType === "mouse" && e.button !== 0)) return;
      dragging = true; decided = false; dx = 0; pid = e.pointerId;
      startX = e.clientX; startY = e.clientY;
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var mx = e.clientX - startX, my = e.clientY - startY;
      if (!decided) {
        if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
        decided = true;
        if (Math.abs(my) > Math.abs(mx)) { dragging = false; return; } // let the page scroll
        userAction();
        try { stage.setPointerCapture(pid); } catch (err) {}
        cards[index].classList.add("dragging");
        cards[index].classList.remove("nudge");
      }
      dx = mx;
      cards[index].style.transform = "translate(" + dx + "px," + Math.abs(dx) * 0.04 + "px) rotate(" + dx / 22 + "deg)";
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      var front = cards[index];
      front.classList.remove("dragging");
      if (!decided) {
        // A tap on the front card jumps to that course below.
        var target = document.getElementById("course-" + COURSES[index].slug);
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        return;
      }
      var far = Math.abs(dx) > Math.min(80, stage.offsetWidth * 0.18);
      if (far && dx < 0) next(-1);           // swipe left: next course
      else { front.style.transform = ""; if (far) prev(); } // swipe right: previous course
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", function () { dragging = false; cards[index].classList.remove("dragging"); cards[index].style.transform = ""; });

    // Pause auto-play while hovered or off screen.
    stage.addEventListener("mouseenter", stopAuto);
    stage.addEventListener("mouseleave", startAuto);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) startAuto(); else stopAuto(); }).observe(stage);
    }

    layout();
    titleEl.textContent = COURSES[0].title;

    // One small nudge so people see the card moves.
    deckHint = function () {
      if (reduceMotion || touched) return;
      setTimeout(function () { if (!touched && !busy) cards[index].classList.add("nudge"); }, 900);
      cards.forEach(function (c) { c.addEventListener("animationend", function () { c.classList.remove("nudge"); }); });
    };
  }
  var deckHint = function () {};

  /* ---------- Start ---------- */
  renderCourses();
  wireJoinLinks();
  $$("[data-split]").forEach(splitWords);
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
  scrollUi();
  parallax();
  videoPreview();
  heroDeck();

  var started = false;
  function start() {
    if (started) return;
    started = true;
    var loader = $(".loader");
    if (loader) loader.classList.add("done");
    $$("[data-rotate]").forEach(rotateWords);
    observeReveals();
    deckHint();
  }
  // Short intro, then reveal the page. Never hold it for more than ~1.6s.
  if (reduceMotion) start();
  else {
    window.addEventListener("load", function () { setTimeout(start, 500); });
    setTimeout(start, 1600);
  }
})();
