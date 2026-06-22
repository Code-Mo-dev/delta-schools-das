window.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".timeline-item");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    items.forEach((item) => observer.observe(item));
  } else {
    // fallback: add class immediately
    items.forEach((item) => item.classList.add("visible"));
  }
});
//* Transfers
function Transfers() {
  //? Home Page
  const homeBtn = document.getElementById("home-btn");
  homeBtn.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  //? Services Page
  const servicesBtn = document.querySelectorAll(".services-btn");
  servicesBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "../services/services.html";
    });
  });

  //? News Page
  const newsBtn = document.getElementById("news-btn");
  newsBtn.addEventListener("click", () => {
    window.location.href = "../News/news.html";
  });

  //? courses Page
  const coursesPageBtn = document.getElementById("courses-btn");
  coursesPageBtn.addEventListener("click", () => {
    window.location.href = "../courses/student-login.html";
  });

  //? Gallery Page
  const galleryPageBtn = document.getElementById("gallery-btn");
  galleryPageBtn.addEventListener("click", () => {
    window.location.href = "../Gallery/gallery.html";
  });

  //? Admission Page
  const admissionBtns = document.getElementById("admission-btn");
  admissionBtns.addEventListener("click", () => {
      window.location.href = "../admission/admission.html";
  });

  //? Contact Us Section
  const contactUsBtn = document.getElementById("contactUs-btn");
    contactUsBtn.addEventListener("click", () => { 
        window.location.href = "../index.html#contactUs";
    });

  //? AI Chat Bot
  const aiBtn = document.getElementById("ai-chat-bot-btn");
    aiBtn.addEventListener("click", () => { 
        window.location.href = "../my-chatbot/public/chatbot.html";
    });

  //* Footer
  //? Company Info Column
  const aboutUsFooterBtn = document.getElementById("aboutBtnFooter");
  aboutUsFooterBtn.addEventListener("click", () => {
    window.location.href = "../index.html";
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

// Date + year (localized; used by i18n.js as a hook)
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

const currentLang = localStorage.getItem('das-lang') || 'en';
updateHeaderDate(currentLang);

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
