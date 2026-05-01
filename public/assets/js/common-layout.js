(function () {
  var headerFallback = `
<header class="header-wrap style1">
    <div class="container">
        <nav class="navbar navbar-expand-md navbar-light">
        <a class="navbar-brand" href="index.html">
                <img class="logo-light" src="assets/img/logo.png" alt="logo">
                <img class="logo-dark" src="assets/img/logo-white.png" alt="logo">
            </a>
            <div class="collapse navbar-collapse main-menu-wrap" id="navbarSupportedContent">
                <div class="menu-close d-lg-none">
                    <a href="javascript:void(0)"> <i class="ri-close-line"></i></a>
                </div>
                <ul class="navbar-nav mx-auto">
                    <li class="nav-item"><a href="index.html" class="nav-link" data-i18n="header.nav.home">Home</a></li>
                    <li class="nav-item"><a href="features.html" class="nav-link" data-i18n="header.nav.features">Features</a></li>
                    <li class="nav-item"><a href="pricing-plan.html" class="nav-link" data-i18n="header.nav.pricing">Pricing</a></li>
                    <li class="nav-item"><a href="blogs.html" class="nav-link" data-i18n="header.nav.blogs">Blogs</a></li>
                    <li class="nav-item"><a href="contact.html" class="nav-link" data-i18n="header.nav.contact_us">Contact Us</a></li>
                </ul>
                <div class="other-options">
                    <div class="option-item"><a href="login.html" class="btn style1 btn-outline btn-login" data-i18n="header.nav.login">Login</a></div>
                    <div class="option-item">
                        <div class="language-selector">
                            <button id="language-switcher" class="language-btn" title="Switch to Arabic">
                                <span class="language-flag">EN</span>
                                <span class="language-text">English</span>
                                <i class="ri-arrow-down-s-line"></i>
                            </button>
                            <div class="language-dropdown">
                                <a href="#" class="language-option" data-lang="en"><span class="flag">EN</span><span>English</span></a>
                                <a href="#" class="language-option" data-lang="ar"><span class="flag">AR</span><span>العربية</span></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <div class="mobile-bar-wrap">
            <div class="mobile-menu d-lg-none">
                <a href="javascript:void(0)"><i class="ri-menu-line"></i></a>
            </div>
        </div>
    </div>
</header>`;

  var footerFallback = `
<footer class="footer-wrap style1">
    <img src="assets/img/footer-shape-1.png" alt="Image" class="footer-shape-one">
    <img src="assets/img/footer-shape-2.png" alt="Image" class="footer-shape-two">
    <div class="container">
        <div class="row pt-100 pb-75">
            <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6">
                <div class="footer-widget">
                    <a href="index.html" class="footer-logo"><img src="assets/img/logo-white.png" alt="Image"></a>
                    <p class="comp-desc" data-i18n="footer.newsletter_text">Subscribe to our newsletter for discounts and more latest offer.</p>
                    <form action="#" class="newsletter-form">
                        <input type="email" placeholder="Enter Your Email" data-i18n-placeholder="footer.email_placeholder">
                        <button type="submit" data-i18n="footer.subscribe_now">SUBSCRIBE NOW</button>
                    </form>
                    <ul class="social-profile style1 list-style">
                        <li><a target="_blank" href="https://facebook.com/"><i class="ri-facebook-line"></i></a></li>
                        <li><a target="_blank" href="https://twitter.com/"><i class="ri-twitter-line"></i></a></li>
                        <li><a target="_blank" href="https://instagram.com/"><i class="ri-instagram-line"></i></a></li>
                        <li><a target="_blank" href="https://linkedin.com/"><i class="ri-linkedin-line"></i></a></li>
                    </ul>
                </div>
            </div>
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-6">
                <div class="footer-widget">
                    <h3 class="footer-widget-title" data-i18n="footer.quick_links">Quick Links</h3>
                    <ul class="footer-menu list-style">
                        <li><a href="index.html" target="_blank" data-i18n="header.nav.home">Home</a></li>
                        <li><a href="features.html" target="_blank" data-i18n="header.nav.features">Features</a></li>
                        <li><a href="pricing-plan.html" target="_blank" data-i18n="header.nav.pricing">Pricing</a></li>
                        <li><a href="blogs.html" target="_blank" data-i18n="header.nav.blogs">Blogs</a></li>
                        <li><a href="contact.html" target="_blank" data-i18n="footer.contact_us">Contact Us</a></li>
                    </ul>
                </div>
            </div>
            <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 ps-xl-4">
                <div class="footer-widget">
                    <h3 class="footer-widget-title" data-i18n="footer.follow_instagram">Follow Instagram</h3>
                    <div class="insta-gallery">
                        <a data-fslightbox href="assets/img/instagram/insta-1.jpg"><img src="assets/img/instagram/insta-1.jpg" alt="Image"></a>
                        <a data-fslightbox href="assets/img/instagram/insta-2.jpg"><img src="assets/img/instagram/insta-2.jpg" alt="Image"></a>
                        <a data-fslightbox href="assets/img/instagram/insta-3.jpg"><img src="assets/img/instagram/insta-3.jpg" alt="Image"></a>
                        <a data-fslightbox href="assets/img/instagram/insta-4.jpg"><img src="assets/img/instagram/insta-4.jpg" alt="Image"></a>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <div class="footer-widget">
                    <h3 class="footer-widget-title" data-i18n="footer.contact_us">Contact Us</h3>
                    <ul class="contact-info list-style">
                        <li><i class="ri-map-pin-fill"></i><p data-i18n="footer.address">5961 De Santa Ave, Huntington Park, CA 90255, USA</p></li>
                        <li><i class="ri-phone-fill"></i><a href="tel:13454567877">+1-3454-5678-77</a><a href="tel:16657234112">+1-6657-2341-12</a></li>
                        <li><i class="ri-mail-open-fill"></i>
                            <a href="https://templates.hibootstrap.com/cdn-cgi/l/email-protection#3d55585151527d4d524b54135e5250"><span class="__cf_email__" data-cfemail="f59d9099999ab5859a839cdb969a98">[email&#160;protected]</span></a>
                            <a href="https://templates.hibootstrap.com/cdn-cgi/l/email-protection#41323431312e333501312e37286f222e2c"><span class="__cf_email__" data-cfemail="14676164647b666054647b627d3a777b79">[email&#160;protected]</span></a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <p class="copyright-text" data-i18n="footer.copyright"><i class="ri-copyright-line"></i> <span>Povi</span>. All Rights Reserved By <a href="https://hibootstrap.com/" target="_blank">HiBootstrap</a></p>
</footer>`;

  function loadPartialSync(path) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return xhr.responseText;
    } catch (e) {
      // ignore and use fallback
    }
    return null;
  }

  function applyActiveNav() {
    var page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    var navTarget = null;

    if (page === "index.html") navTarget = "index.html";
    else if (page === "features.html") navTarget = "features.html";
    else if (page === "pricing-plan.html") navTarget = "pricing-plan.html";
    else if (page === "blogs.html") navTarget = "blogs.html";
    else if (page === "contact.html") navTarget = "contact.html";

    if (!navTarget) return;

    var links = document.querySelectorAll(".header-wrap .navbar-nav .nav-link");
    links.forEach(function (link) {
      if (link.getAttribute("href") === navTarget) link.classList.add("active");
      else link.classList.remove("active");
    });
  }

  var headerMount = document.getElementById("site-header");
  if (headerMount) {
    headerMount.innerHTML = loadPartialSync("partials/header.html") || headerFallback;
  }

  var footerMount = document.getElementById("site-footer");
  if (footerMount) {
    footerMount.innerHTML = loadPartialSync("partials/footer.html") || footerFallback;
  }

  applyActiveNav();

  if (window.i18n && typeof window.i18n.applyTranslations === "function") {
    window.i18n.applyTranslations();
    if (typeof window.i18n.updateLanguageSwitcher === "function") window.i18n.updateLanguageSwitcher();
    if (typeof window.i18n.setupLanguageSwitcher === "function") window.i18n.setupLanguageSwitcher();
  }
})();






