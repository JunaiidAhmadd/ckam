(function () {
  var titleEl = document.getElementById("journeyBoardTitle");
  var subtitleEl = document.getElementById("journeySubtitle");
  var imageEls = [
    document.getElementById("journeyImg1"),
    document.getElementById("journeyImg2"),
    document.getElementById("journeyImg3"),
    document.getElementById("journeyImg4"),
    document.getElementById("journeyImg5")
  ];

  var topTabsWrap = document.getElementById("journeyTopTabs");
  var sideWrap = document.getElementById("journeySideOptions");
  if (!titleEl || !subtitleEl || !topTabsWrap || !sideWrap || imageEls.some(function (el) { return !el; })) return;
  var currentNode = null;

  function t(key, fallback) {
    if (window.i18n && typeof window.i18n.translate === "function" && key) {
      var translated = window.i18n.translate(key);
      if (translated && translated !== key) return translated;
    }
    return fallback || "";
  }

  function applyPreview(node) {
    var title = t(node.getAttribute("data-title-key"), node.getAttribute("data-title") || titleEl.textContent);
    var subtitle = t(node.getAttribute("data-subtitle-key"), node.getAttribute("data-subtitle") || subtitleEl.textContent);
    var images = (node.getAttribute("data-images") || "").split(",");

    titleEl.textContent = title;
    subtitleEl.textContent = subtitle;
    imageEls.forEach(function (img, i) {
      if (images[i]) img.src = images[i].trim();
    });
  }

  function activateInGroup(group, node) {
    group.querySelectorAll("li").forEach(function (li) {
      li.classList.remove("active");
    });
    node.classList.add("active");
  }

  topTabsWrap.querySelectorAll("li").forEach(function (li) {
    li.addEventListener("click", function () {
      activateInGroup(topTabsWrap, li);
      currentNode = li;
      applyPreview(li);
    });
  });

  sideWrap.querySelectorAll("li").forEach(function (li) {
    li.addEventListener("click", function () {
      activateInGroup(sideWrap, li);
      currentNode = li;
      applyPreview(li);
    });
  });

  document.querySelectorAll(".language-option").forEach(function (langOpt) {
    langOpt.addEventListener("click", function () {
      setTimeout(function () {
        var active = currentNode || topTabsWrap.querySelector("li.active") || sideWrap.querySelector("li.active");
        if (active) applyPreview(active);
      }, 200);
    });
  });

  var bootActive = topTabsWrap.querySelector("li.active") || sideWrap.querySelector("li.active");
  if (bootActive) {
    currentNode = bootActive;
    applyPreview(bootActive);
  }
})();
