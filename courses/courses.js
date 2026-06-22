const token = sessionStorage.getItem('student_token');
if (!token) window.location.href = '/student-login';

function getLang() { return localStorage.getItem('das-lang') || 'en'; }

function getCourseField(c, field) {
  const arField = c[field + '_ar'];
  return (getLang() === 'ar' && arField && arField.trim()) ? arField : c[field];
}

// Welcome message
function updateWelcome() {
  const name = sessionStorage.getItem('student_name') || 'Student';
  const prefix = getLang() === 'ar' ? 'مرحباً، ' : 'Welcome, ';
  document.getElementById('studentName').textContent = prefix + name;
}
updateWelcome();

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.clear(); window.location.href = '/index.html';
});

// Date
function updateHeaderDate(lang) {
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  const el = document.getElementById('headerDate');
  if (el) el.textContent = new Date().toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
updateHeaderDate(getLang());
document.getElementById('year').textContent = new Date().getFullYear();

// Reload page on language change so courses render in correct language
if (typeof I18N !== 'undefined') {
  const _orig = I18N.setLang.bind(I18N);
  I18N.setLang = async function (lang) {
    localStorage.setItem('das-lang', lang);
    location.reload();
  };
}

let allCourses = [], activeGrade = '';

async function fetchCourses() {
  try {
    const url = activeGrade ? `/api/courses?grade=${encodeURIComponent(activeGrade)}` : '/api/courses';
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (res.status === 401) { window.location.href = '/student-login'; return; }
    allCourses = await res.json();
    renderCourses(allCourses);
  } catch (e) {
    document.getElementById('coursesMain').innerHTML =
      `<div class="state"><h2>${getLang()==='ar'?'خطأ في الاتصال':'Connection Error'}</h2><p>${getLang()==='ar'?'تعذّر الوصول إلى الخادم.':'Could not reach the server.'}</p></div>`;
  }
}

async function fetchGrades() {
  try {
    const res = await fetch('/api/courses/grades', { headers: { Authorization: 'Bearer ' + token } });
    const grades = await res.json();
    const bar = document.getElementById('filterBar');
    grades.forEach(g => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn'; btn.dataset.grade = g; btn.textContent = g;
      btn.addEventListener('click', () => setGrade(g));
      bar.appendChild(btn);
    });
  } catch (e) { }
}

function setGrade(g) {
  activeGrade = g;
  document.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.grade === g));
  fetchCourses();
}
document.getElementById('filterBar').addEventListener('click', e => {
  if (e.target.dataset.grade === '') setGrade('');
});

function getYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function renderCourses(courses) {
  const main = document.getElementById('coursesMain');
  const isRTL = getLang() === 'ar';
  if (!courses.length) {
    main.innerHTML = `<div class="state"><h2>${isRTL?'لا كورسات بعد':'No Courses Yet'}</h2><p>${isRTL?'تابعنا قريباً.':'Check back soon.'}</p></div>`; return;
  }
  const groups = {};
  courses.forEach(c => { if (!groups[c.grade]) groups[c.grade] = []; groups[c.grade].push(c); });
  main.innerHTML = Object.entries(groups).map(([grade, list]) => `
    <div class="grade-section">
      <div class="grade-heading"><hr/><h2>${grade}</h2><hr/></div>
      <div class="courses-grid">
        ${list.map(c => {
    const ytId = getYtId(c.videoUrl);
    const title = getCourseField(c, 'title');
    const description = getCourseField(c, 'description');
    const dir = (isRTL && c.title_ar) ? 'dir="rtl" style="font-family:Cairo,sans-serif;text-align:right;"' : '';
    const thumb = ytId
      ? `<img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="${title}"/>
               <div class="play-icon"><i class="fa-solid fa-circle-play"></i></div>`
      : `<div class="no-thumb"><i class="fa-solid fa-book-open"></i><span>${isRTL?'لا فيديو':'No Video'}</span></div>`;
    return `<article class="course-card" data-id="${c._id}" ${dir}>
            <div class="course-thumb">${thumb}</div>
            <div class="course-body">
              <p class="course-subject">${c.subject}</p>
              <h3 class="course-title">${title}</h3>
              <p class="course-desc">${description}</p>
              <div class="course-footer">
                <span class="course-grade">${c.grade}</span>
                ${c.pdfUrl ? `<a class="course-pdf" href="${c.pdfUrl}" target="_blank" onclick="event.stopPropagation()">
                  <i class="fa-solid fa-file-pdf"></i> PDF</a>`: ''}
              </div>
            </div>
          </article>`;
  }).join('')}
      </div>
    </div>`).join('');
  document.querySelectorAll('.course-card').forEach(card =>
    card.addEventListener('click', () => openModal(card.dataset.id)));
}

function openModal(id) {
  const c = allCourses.find(x => x._id === id); if (!c) return;
  const isRTL = getLang() === 'ar';
  const hasAr = isRTL && c.title_ar && c.title_ar.trim();
  const title = getCourseField(c, 'title');
  const description = getCourseField(c, 'description');

  const ytId = getYtId(c.videoUrl);
  const v = document.getElementById('modalVideo');
  v.innerHTML = ytId ? `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1" allow="autoplay;fullscreen" allowfullscreen></iframe>` : '';
  v.style.display = ytId ? 'block' : 'none';

  const modalEl = document.querySelector('.modal');
  modalEl.style.direction  = hasAr ? 'rtl' : 'ltr';
  modalEl.style.fontFamily = hasAr ? 'Cairo, sans-serif' : '';
  modalEl.style.textAlign  = hasAr ? 'right' : '';

  document.getElementById('modalSubject').textContent = c.subject;
  document.getElementById('modalTitle').textContent   = title;
  document.getElementById('modalMeta').textContent    = `${c.grade} · ${c.subject} · ${hasAr?'أضافه':'Added by'} ${c.instructor}`;
  document.getElementById('modalDesc').textContent    = description;
  const pdf = document.getElementById('modalPdf');
  pdf.href = c.pdfUrl || '#'; pdf.style.display = c.pdfUrl ? 'inline-flex' : 'none';
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalVideo').innerHTML = '';
  document.body.style.overflow = '';
}
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

fetchGrades();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchCourses);
} else {
  setTimeout(fetchCourses, 0);
}

// Re-render courses + welcome + date when language changes
window.addEventListener('load', () => {
  if (typeof I18N === 'undefined') return;
  const _orig = I18N.setLang.bind(I18N);
  I18N.setLang = async function(lang) {
    await _orig(lang);
    if (allCourses.length) renderCourses(allCourses);
    updateWelcome();
    updateHeaderDate(lang);
  };
});
