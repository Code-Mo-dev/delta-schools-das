const API = window.location.origin + '/api';
let allPosts = [];
let activeCategory = '';

// ── Language helper ───────────────────────────────────────────
function getLang() {
  return localStorage.getItem('das-lang') || 'en';
}

function postField(post, field) {
  const arField = post[field + '_ar'];
  return (getLang() === 'ar' && arField && arField.trim()) ? arField : post[field];
}

// ── Date ──────────────────────────────────────────────────────
function updateHeaderDate(lang = getLang()) {
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  document.getElementById('today-date').textContent =
    new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
updateHeaderDate();
document.getElementById('year').textContent = new Date().getFullYear();

// Reload page on language change so posts render in correct language
const _orig = I18N.setLang.bind(I18N);
I18N.setLang = async function (lang) {
  localStorage.setItem('das-lang', lang);
  location.reload();
};

// ── Fetch & Render ────────────────────────────────────────────
async function fetchPosts() {
  try {
    const url = activeCategory ? `${API}/posts?category=${encodeURIComponent(activeCategory)}` : `${API}/posts`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    allPosts = await res.json();
    renderPosts(allPosts);
  } catch (e) {
    document.getElementById('posts-grid').innerHTML = `
        <div class="state">
          <h2>Connection Error</h2>
          <p>Could not reach the server. Make sure it's running on port 3000.</p>
        </div>`;
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API}/categories`);
    const cats = await res.json();
    const bar = document.getElementById('filter-bar');
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.cat = cat;
      btn.textContent = cat;
      btn.addEventListener('click', () => setCategory(cat));
      bar.appendChild(btn);
    });
  } catch (e) { /* silent */ }
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  fetchPosts();
}
document.getElementById('filter-bar').addEventListener('click', e => {
  if (e.target.dataset.cat === '') setCategory('');
});

// ── Render Posts ──────────────────────────────────────────────
function excerpt(text, len = 160) {
  return text.length > len ? text.slice(0, len).trimEnd() + '…' : text;
}

function formatDate(iso) {
  const locale = getLang() === 'ar' ? 'ar-EG' : 'en-US';
  return new Date(iso).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
}

function renderPosts(posts) {
  const grid = document.getElementById('posts-grid');
  const isRTL = getLang() === 'ar';

  if (!posts.length) {
    grid.innerHTML = `<div class="state"><h2>No Stories Yet</h2><p>Check back soon for the latest news.</p></div>`;
    return;
  }

  let html = '';
  posts.forEach((post, i) => {
    const isFeatured = i === 0;
    const title = postField(post, 'title');
    const body = postField(post, 'body');
    const dir = (isRTL && post.title_ar) ? 'dir="rtl" style="font-family:Cairo,sans-serif;text-align:right;"' : '';

    const imgTag = post.image
      ? `<img class="post-card-img" src="${post.image}" alt="${title}" />`
      : '';

    html += `
    <article class="post-card ${isFeatured ? 'featured' : ''}" data-id="${post._id}" ${dir}>
        ${imgTag}
        <div class="post-card-body">
            <p class="post-category">${post.category}</p>
            <h2 class="post-title">${title}</h2>
            <p class="post-excerpt">${excerpt(body)}</p>
            <p class="post-meta">${post.author} · ${formatDate(post.createdAt)}</p>
        </div>
    </article>
    ${i === 0 ? '<hr class="col-divider" />' : ''}
    `;
  });

  grid.innerHTML = html;
  grid.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(id) {
  const post = allPosts.find(p => p._id === id);
  if (!post) return;

  const isRTL = getLang() === 'ar';
  const hasAr = isRTL && post.title_ar && post.title_ar.trim();
  const title = postField(post, 'title');
  const body = postField(post, 'body');

  const img = document.getElementById('modal-img');
  if (post.image) { img.src = post.image; img.style.display = 'block'; }
  else { img.style.display = 'none'; }

  const modalBody = document.getElementById('modal');
  modalBody.style.direction = hasAr ? 'rtl' : 'ltr';
  modalBody.style.fontFamily = hasAr ? 'Cairo, sans-serif' : '';
  modalBody.style.textAlign = hasAr ? 'right' : '';

  document.getElementById('modal-category').textContent = post.category;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-meta').textContent = `${hasAr ? 'بقلم' : 'By'} ${post.author} · ${formatDate(post.createdAt)}`;
  document.getElementById('modal-text').textContent = body;

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ── Init ──────────────────────────────────────────────────────
// Wait for i18n to finish before first fetch so language is set correctly
fetchCategories();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchPosts);
} else {
  // i18n.js fires init on DOMContentLoaded — give it a tick to finish
  setTimeout(fetchPosts, 0);
}

// Re-render posts + date when language changes
window.addEventListener('load', () => {
  if (typeof I18N === 'undefined') return;
  const _orig = I18N.setLang.bind(I18N);
  I18N.setLang = async function (lang) {
    await _orig(lang);
    if (allPosts.length) renderPosts(allPosts);
    updateHeaderDate(lang);
  };
});
