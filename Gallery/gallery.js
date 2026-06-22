function Transfers() {
  //? Home Page
  const homeBtn = document.getElementById("home-btn");
  homeBtn.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  //? About Page
  const aboutUsPageBtn = document.getElementById("aboutUs-btn");
  aboutUsPageBtn.addEventListener("click", () => {
    window.location.href = "../aboutUs/aboutUs.html";
  });

  //? Services Page
  const servicesBtn = document.getElementById("services-btn");
  servicesBtn.addEventListener("click", () => {
    window.location.href = "../services/services.html";
  });

  //? Courses Page
  const coursesBtn = document.getElementById("courses-btn");
  coursesBtn.addEventListener("click", () => {
    window.location.href = "../courses/student-login.html";
  });

  //? News Page
  const newsBtn = document.getElementById("news-btn");
  newsBtn.addEventListener("click", () => {
    window.location.href = "../News/news.html";
  });

//? Admission Page
  const admissionBtn = document.getElementById("admission-btn");
  admissionBtn.addEventListener("click", () => {
    window.location.href = "../admission/admission.html";
  });
  
  //? ContactUs Page
  const contactUsPageBtn = document.getElementById("contactUs-btn");
  contactUsPageBtn.addEventListener("click", () => {
    window.location.href = "../index.html#contactUs";
  });

  //? AI Chat
  const aiChatBtn = document.getElementById("ai-chat-bot-btn");
  if (aiChatBtn) {
    aiChatBtn.addEventListener("click", () => {
      window.location.href = "../my-chatbot/public/chatbot.html";
    });
  }
  //* Footer
  //? Company Info Column
  const aboutUsFooterBtn = document.getElementById("aboutBtnFooter");
  aboutUsFooterBtn.addEventListener("click", () => {
    window.location.href = "../aboutUs/aboutUs.html";
  });
  const servicesFooterBtn = document.getElementById("servicesBtnFooter");
  servicesFooterBtn.addEventListener("click", () => {
    window.location.href = "../services/services.html";
  });
  const hiringFooterBtn = document.getElementById("hiringBtnFooter");
  hiringFooterBtn.addEventListener("click", () => {
    window.open("https://www.linkedin.com/company/delta-american-school/jobs/?originalSubdomain=eg", "_blank");
  });
  const socialMediaFooterBtn = document.getElementById("socialMediaBtnFooter");
  socialMediaFooterBtn.addEventListener("click", () => {
    window.location.href = "../index.html#contactUs";
  });
  //? Admin Column
  const adminToPostStudioBtn = document.getElementById("adminToPostStudioBtn");
  adminToPostStudioBtn.addEventListener("click", () => {
    window.location.href = "../News/admin.html";
  });
  const adminToCourseStudioBtn = document.getElementById("adminToCourseStudioBtn");
  adminToCourseStudioBtn.addEventListener("click", () => {
    window.location.href = "../courses/courses-admin.html";
  });
  //? Features Column
  const aiChatBotBtnFooter = document.getElementById("aiBtnFooter");
  aiChatBotBtnFooter.addEventListener("click", () => {
    window.location.href = "../my-chatbot/public/chatbot.html";
  });
  const submitDocumentsBtnFooter = document.getElementById("SubmitDocumentsBtnFooter");
  submitDocumentsBtnFooter.addEventListener("click", () => {
    window.location.href = "../sendAdmissionPapers/pages/send-admission-papers.html";
  });
  const VisitBtnFooter = document.getElementById("VisitBtnFooter");
  VisitBtnFooter.addEventListener("click", () => {
    window.location.href = "../SendTheVisitAppointment/Send-to-visit.html";
  });
  const CoursesBtnFooter = document.getElementById("CoursesBtnFooter");
  CoursesBtnFooter.addEventListener("click", () => {
    window.location.href = "../courses/courses.html";
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

//* Nav Overlay — fullscreen menu
(function () {
  const hamburger = document.querySelector(".icon_vector");
  const overlay   = document.getElementById("navOverlay");
  if (!hamburger || !overlay) return;

  function openNav() {
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    hamburger.classList.add("active");
    document.body.classList.add("nav-open");
  }

  function closeNav() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    hamburger.classList.remove("active");
    document.body.classList.remove("nav-open");
  }

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    overlay.classList.contains("active") ? closeNav() : openNav();
  });

  overlay.querySelectorAll("button[data-url]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeNav();
      window.location.href = btn.getAttribute("data-url");
    });
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
})();

//* Fancybox library
//? Activate the gallery with the episode
Fancybox.bind("data-fancybox='school-gallery'", {
  loop: true,
  Toolbar: {
    display: ["close", "counter", "arrowLeft", "arrowRight"],
  },
});

//*  Set the current date in the header and footer
const now = new Date();
document.getElementById("header-date").textContent = now.toLocaleDateString(
  "en-US",
  { weekday: "long", year: "numeric", month: "long", day: "numeric" },
);
document.getElementById("footer-year").textContent = now.getFullYear();

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
