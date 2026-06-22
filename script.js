//* Transfers
function Transfers() {
  //? Home Page
  const homeBtn = document.getElementById("home-btn");
  homeBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  //? AboutUs Section
  const aboutUsBtn = document.getElementById("aboutUs-btn");
  aboutUsBtn.addEventListener("click", () => {
    document.querySelector(".aboutUs").scrollIntoView({
      behavior: "smooth",
    });
  });

  //? About Page
  const aboutUsPageBtn = document.querySelectorAll(".toAboutUsPage");
  aboutUsPageBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "aboutUs/aboutUs.html";
    });
  });

  //? Services Page
  const servicesBtn = document.querySelectorAll(".services-btn");
  servicesBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "services/services.html";
    });
  });

  //? courses Page
  const coursesPageBtn = document.getElementById("courses-btn");
  coursesPageBtn.addEventListener("click", () => {
    window.location.href = "courses/student-login.html";
  });

  //? News Page
  const newsBtn = document.getElementById("news-btn");
  newsBtn.addEventListener("click", () => {
    window.location.href = "News/news.html";
  });

  //? Gallery Section
  const galleryBtn = document.getElementById("gallery-btn");
  galleryBtn.addEventListener("click", () => {
    document.querySelector(".gallery").scrollIntoView({
      behavior: "smooth",
    });
  });

  //? Gallery Page
  const galleryPageBtn = document.getElementById("toGalleryPage");
  galleryPageBtn.addEventListener("click", () => {
    window.location.href = "Gallery/gallery.html";
  });

  //? Admission Page
  const admission = document.querySelectorAll(".admission-btn");
  admission.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "admission/admission.html";
    });
  });

  //? ContactUs Section
  const contactUsBtn = document.getElementById("contactUs-btn");
  contactUsBtn.addEventListener("click", () => {
    document.querySelector(".contactUs").scrollIntoView({
      behavior: "smooth",
    });
  });

  //? AI ChatBot Page
  const aiChatBotBtn = document.getElementById("ai-chat-bot-btn");
  aiChatBotBtn.addEventListener("click", () => {
    window.location.href = "my-chatbot/public/chatbot.html";
  });

  //* contactUs section
  //? buttons
  const phoneOneBtn = document.querySelector(".phoneOne-btn");
  phoneOneBtn.addEventListener("click", () => {
    window.location.href = "tel:+201090700727";
  });
  const phoneTwoBtn = document.querySelector(".phoneTwo-btn");
  phoneTwoBtn.addEventListener("click", () => {
    window.location.href = "tel:+201066276898";
  });
  const emailBtn = document.querySelector(".email-btn");
  emailBtn.addEventListener("click", () => {
    window.open("mailto:info@delta.edu.eg");
  });
  //? icons
  const facebookBtn = document.getElementById("facebook-btn");
  facebookBtn.addEventListener("click", () => {
    window.open("https://www.facebook.com/Delta.A.S/?locale=ar_AR", "_blank");
  });
  const instagramBtn = document.getElementById("instagram-btn");
  instagramBtn.addEventListener("click", () => {
    window.open(
      "https://www.instagram.com/deltaamericanschool/?hl=ar",
      "_blank",
    );
  });
  const linkedinBtn = document.getElementById("linkedin-btn");
  linkedinBtn.addEventListener("click", () => {
    window.open(
      "https://www.linkedin.com/company/delta-american-school/?originalSubdomain=eg",
      "_blank",
    );
  });
  //* Footer
  //? Company Info Column
  const aboutUsFooterBtn = document.getElementById("aboutBtnFooter");
  aboutUsFooterBtn.addEventListener("click", () => {
    window.location.href = "aboutUs/aboutUs.html";
  });
  const servicesFooterBtn = document.getElementById("servicesBtnFooter");
  servicesFooterBtn.addEventListener("click", () => {
    window.location.href = "services/services.html";
  });
  const hiringFooterBtn = document.getElementById("hiringBtnFooter");
  hiringFooterBtn.addEventListener("click", () => {
    window.open("https://www.linkedin.com/company/delta-american-school/jobs/?originalSubdomain=eg", "_blank");
  });
  const socialMediaFooterBtn = document.getElementById("socialMediaBtnFooter");
  socialMediaFooterBtn.addEventListener("click", () => {
    window.location.href = "#contactUs";
  });
  //? Admin Column
  const adminToPostStudioBtn = document.getElementById("adminToPostStudioBtn");
  adminToPostStudioBtn.addEventListener("click", () => {
    window.location.href = "News/admin.html";
  });
  const adminToCourseStudioBtn = document.getElementById("adminToCourseStudioBtn");
  adminToCourseStudioBtn.addEventListener("click", () => {
    window.location.href = "courses/courses-admin.html";
  });
  //? Features Column
  const aiChatBotBtnFooter = document.getElementById("aiBtnFooter");
  aiChatBotBtnFooter.addEventListener("click", () => {
    window.location.href = "my-chatbot/public/chatbot.html";
  });
  const submitDocumentsBtnFooter = document.getElementById("SubmitDocumentsBtnFooter");
  submitDocumentsBtnFooter.addEventListener("click", () => {
    window.location.href = "sendAdmissionPapers/pages/send-admission-papers.html";
  });
  const VisitBtnFooter = document.getElementById("VisitBtnFooter");
  VisitBtnFooter.addEventListener("click", () => {
    window.location.href = "SendTheVisitAppointment/Send-to-visit.html";
  });
  const CoursesBtnFooter = document.getElementById("CoursesBtnFooter");
  CoursesBtnFooter.addEventListener("click", () => {
    window.location.href = "courses/student-login.html";
  });
  //? ContactUs Column
  const numberOneBtnFooter = document.getElementById("numberOneBtnFooter");
  numberOneBtnFooter.addEventListener("click", () => {
    window.location.href = "tel:+201090700727";
  });
  const MailBtnFooter = document.getElementById("MailBtnFooter");
  MailBtnFooter.addEventListener("click", () => {
    window.open("mailto:info@delta.edu.eg", "_blank");
  });
  const locationBtnFooter = document.getElementById("locationBtnFooter");
  locationBtnFooter.addEventListener("click", () => {
    window.open("https://maps.app.goo.gl/QQPrtHqdyHhDpDFX9", "_blank");
  });

}
Transfers();

//* swiper Library
const swiper = new Swiper(".mySwiper", {
  loop: true,
  loopAdditionalSlides: 2,
  centeredSlides: true,
  dir: document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr',
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  breakpoints: {
    0:    { slidesPerView: 1, spaceBetween: 0 },
    576:  { slidesPerView: 1, spaceBetween: 0 },
    992:  { slidesPerView: 3, spaceBetween: 10 },
    1200: { slidesPerView: 3, spaceBetween: 10 },
  },
});

//* Leaflet.js => (map)
function leafletMap() {
  var map = L.map("map").setView([31.071342033041653, 31.38589944232895], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  var customIcon = L.icon({
    iconUrl: "pictures/Icons/map-pin.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  L.marker([31.071342033041653, 31.38589944232895], { icon: customIcon })
    .addTo(map)
    .bindPopup("Delta American Schools")
    .openPopup();
}
leafletMap();

//* nextBtn {Scroll Down Button}
function nextBtn() {
  let sections = document.querySelectorAll("#main section");
  let btn = document.querySelector("#nextBtn");
  let footer = document.querySelector("footer");

  let index = 0;

  btn.addEventListener("click", () => {
    index++;

    if (index >= sections.length) {
      index = 0;
    }

    sections[index].scrollIntoView({
      behavior: "smooth",
    });
  });
  // Hide/Show button based on footer visibility
  if (footer && btn) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          btn.style.display = "none";
        } else {
          btn.style.display = "block";
        }
      });
    }, { threshold: 0.1 });

    observer.observe(footer);
  }
}
nextBtn();

// Definition of function to update the header date based on the current language.
function updateHeaderDate(lang) {
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  const now = new Date();
  const dateEl = document.getElementById("header-date");

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
// Change the date language according to the stored language.
const currentLang = localStorage.getItem('das-lang') || 'en';
updateHeaderDate(currentLang);
// Update date footer year Independently
const footerYearEl = document.getElementById("footer-year");
if (footerYearEl) {
  footerYearEl.textContent = new Date().getFullYear();
}

//* Nav Overlay — fullscreen menu
(function () {
  const hamburger = document.querySelector('.icon_vector');
  const overlay = document.getElementById('navOverlay');
  if (!hamburger || !overlay) return;

  // Open
  function openNav() {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('active');
    document.body.classList.add('nav-open');
  }

  // Close
  function closeNav() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('active');
    document.body.classList.remove('nav-open');
  }

  // Toggle on hamburger click
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.classList.contains('active') ? closeNav() : openNav();
  });

  // Wire each overlay button
  overlay.querySelectorAll('button[data-url]').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      closeNav();
      // Scroll target (starts with #)
      if (url.startsWith('#')) {
        const target = document.querySelector(url);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = url;
      }
    });
  });

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeNav();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
})();
