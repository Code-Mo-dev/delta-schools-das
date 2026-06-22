const I18N = (function () {

    const STORAGE_KEY = 'das-lang';
    const DEFAULT_LANG = 'en';
    let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    let translations = {};
    const _callbacks = [];   // ← pages register re-render functions here

    // Load JSON file for given language
    async function loadTranslations(lang) {
        const res = await fetch(`/locales/${lang}.json`);
        translations = await res.json();
    }

    // Resolve dot-notation key e.g. "nav.home"
    function resolve(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], translations) || key;
    }

    // Apply all translations to the page
    function applyTranslations() {
        // Text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = resolve(el.dataset.i18n);
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = resolve(el.dataset.i18nPlaceholder);
        });

        // HTML direction + lang attribute
        const isRTL = currentLang === 'ar';
        document.documentElement.setAttribute('lang', currentLang);
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        document.body.classList.toggle('rtl', isRTL);

        // Update toggle button label
        const btns = document.querySelectorAll('#lang-toggle');
        btns.forEach(btn => {
            btn.innerHTML = isRTL
                ? '<i class="fa-solid fa-globe"></i> EN'
                : '<i class="fa-solid fa-globe"></i> عربي';
        });

        // Update header date locale
        if (typeof updateHeaderDate === 'function') {
            updateHeaderDate(currentLang);
        }

        // Update Swiper direction (fixes RTL gaps)
        const swiperEl = document.querySelector('.mySwiper');
        if (swiperEl && swiperEl.swiper) {
            swiperEl.swiper.changeLanguageDirection(isRTL ? 'rtl' : 'ltr');
            swiperEl.swiper.update();
        }

        // Run any registered re-render callbacks
        _callbacks.forEach(fn => { try { fn(currentLang); } catch(e) {} });
    }

    // Public: switch language
    async function setLang(lang) {
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        await loadTranslations(lang);
        applyTranslations();
    }

    // Public: init on page load
    async function init() {
        await loadTranslations(currentLang);
        applyTranslations();
    }

    // Public: register a callback to run after every language switch
    function onLangChange(fn) {
        _callbacks.push(fn);
    }

    return { init, setLang, currentLang: () => currentLang, onLangChange };
})();

document.addEventListener('DOMContentLoaded', () => I18N.init());