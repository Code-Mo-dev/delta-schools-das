const API = "http://localhost:3000/api";
let authToken = sessionStorage.getItem("admin_token") || null;

// ── Auto-login if token saved ──────────────────────────────────
if (authToken) showAdmin();

// ── Login ──────────────────────────────────────────────────────
async function doLogin() {
    const pw = document.getElementById("password-input").value.trim();
    if (!pw) return;

    const btn = document.getElementById("login-btn");
    btn.textContent = "Authenticating…";
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pw }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
            authToken = data.token;
            sessionStorage.setItem("admin_token", authToken);
            showAdmin();
        } else {
            document.getElementById("login-error").style.display = "block";
            btn.textContent = "Authenticate";
            btn.disabled = false;
        }
    } catch (e) {
        document.getElementById("login-error").textContent =
            "⚠ Could not reach server. Is it running?";
        document.getElementById("login-error").style.display = "block";
        btn.textContent = "Authenticate";
        btn.disabled = false;
    }
}

document.getElementById("login-btn").addEventListener("click", doLogin);
document
    .getElementById("password-input")
    .addEventListener("keydown", (e) => {
        if (e.key === "Enter") doLogin();
    });

function showAdmin() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("admin-screen").style.display = "block";
    loadCategories();
}

document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("admin_token");
    authToken = null;
    location.reload();
});

// ── Tabs ───────────────────────────────────────────────────────
document.querySelectorAll(".admin-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document
            .querySelectorAll(".admin-nav-btn")
            .forEach((b) => b.classList.remove("active"));
        document
            .querySelectorAll(".tab-panel")
            .forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        document
            .getElementById("tab-" + btn.dataset.tab)
            .classList.add("active");
        if (btn.dataset.tab === "manage") loadPosts();
    });
});

// ── Image Preview ──────────────────────────────────────────────
const dropZone = document.getElementById("drop-zone");
const imgInput = document.getElementById("post-image");
const imgPreview = document.getElementById("img-preview");

imgInput.addEventListener("change", () => showPreview(imgInput.files[0]));

["dragover", "dragleave", "drop"].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        if (evt === "dragover") dropZone.classList.add("dragover");
        else dropZone.classList.remove("dragover");
        if (evt === "drop" && e.dataTransfer.files[0]) {
            imgInput.files = e.dataTransfer.files;
            showPreview(e.dataTransfer.files[0]);
        }
    });
});

function showPreview(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        imgPreview.src = e.target.result;
        imgPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

// ── Char Count ─────────────────────────────────────────────────
document
    .getElementById("post-body")
    .addEventListener("input", function () {
        document.getElementById("char-count").textContent =
            this.value.length.toLocaleString() + " characters";
    });

// ── Categories Suggestions ────────────────────────────────────
async function loadCategories() {
    try {
        const res = await fetch(`${API}/categories`);
        const cats = await res.json();
        const dl = document.getElementById("category-suggestions");
        cats.forEach((c) => {
            const opt = document.createElement("option");
            opt.value = c;
            dl.appendChild(opt);
        });
    } catch (e) {
        /* silent */
    }
}

// ── Submit Post ────────────────────────────────────────────────
document
    .getElementById("submit-btn")
    .addEventListener("click", async () => {
        const title = document.getElementById("post-title").value.trim();
        const body = document.getElementById("post-body").value.trim();
        const title_ar = document.getElementById("post-title-ar").value.trim();
        const body_ar = document.getElementById("post-body-ar").value.trim();
        const author = document.getElementById("post-author").value.trim();
        const category = document.getElementById("post-category").value.trim();
        const imageFile = imgInput.files[0];

        if (!title || !body || !author || !category) {
            showAlert(
                "Please fill in all required fields (Headline, Author, Category, Body).",
                "error",
            );
            return;
        }

        const btn = document.getElementById("submit-btn");
        btn.textContent = "Publishing…";
        btn.disabled = true;

        const formData = new FormData();
        formData.append("title", title);
        formData.append("body", body);
        formData.append("title_ar", title_ar);
        formData.append("body_ar", body_ar);
        formData.append("author", author);
        formData.append("category", category);
        if (imageFile) formData.append("image", imageFile);

        try {
            const res = await fetch(`${API}/posts`, {
                method: "POST",
                headers: { Authorization: "Bearer " + authToken },
                body: formData,
            });
            if (res.ok) {
                showAlert("✓ Article published successfully!", "success");
                resetForm();
            } else {
                const err = await res.json();
                showAlert("Error: " + (err.message || "Unknown error"), "error");
            }
        } catch (e) {
            showAlert("Could not reach server. Is it running?", "error");
        } finally {
            btn.textContent = "Publish Article →";
            btn.disabled = false;
        }
    });

function resetForm() {
    ["post-title", "post-title-ar", "post-body", "post-body-ar", "post-author", "post-category"].forEach(
        (id) => (document.getElementById(id).value = ""),
    );
    imgInput.value = "";
    imgPreview.style.display = "none";
    document.getElementById("char-count").textContent = "0 characters";
}

document.getElementById("reset-btn").addEventListener("click", () => {
    resetForm();
    hideAlert();
});

function showAlert(msg, type) {
    const el = document.getElementById("form-alert");
    el.textContent = msg;
    el.className = "form-alert " + type;
    el.style.display = "block";
    if (type === "success") setTimeout(hideAlert, 4000);
}
function hideAlert() {
    const el = document.getElementById("form-alert");
    el.style.display = "none";
}

// ── Load & Manage Posts ────────────────────────────────────────
async function loadPosts() {
    const container = document.getElementById("post-list-container");
    container.innerHTML = '<div class="posts-empty">Loading…</div>';

    try {
        const res = await fetch(`${API}/posts`);
        const posts = await res.json();

        document.getElementById("post-count").textContent =
            posts.length + " article" + (posts.length !== 1 ? "s" : "");

        if (!posts.length) {
            container.innerHTML =
                '<div class="posts-empty">No posts yet. Create your first article.</div>';
            return;
        }

        container.innerHTML = "";
        const list = document.createElement("div");
        list.className = "post-list";

        posts.forEach((post) => {
            const item = document.createElement("div");
            item.className = "post-list-item";

            const thumb = post.image
                ? `<img class="post-list-thumb" src="${post.image}" alt="${post.title}" />`
                : `<div class="post-list-no-img">📄</div>`;

            const date = new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });

            item.innerHTML = `
    ${thumb}
    <div class="post-list-info">
        <div class="post-list-title">${post.title}</div>
        <div class="post-list-meta">${post.author} · ${date}</div>
    </div>
    <span class="post-list-cat">${post.category}</span>
    <button class="btn-delete" data-id="${post._id}" title="Delete">✕</button>
    `;
            list.appendChild(item);
        });

        container.appendChild(list);

        container.querySelectorAll(".btn-delete").forEach((btn) => {
            btn.addEventListener("click", () => deletePost(btn.dataset.id));
        });
    } catch (e) {
        container.innerHTML =
            '<div class="posts-empty">Error loading posts. Is the server running?</div>';
    }
}

async function deletePost(id) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    try {
        const res = await fetch(`${API}/posts/${id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + authToken },
        });
        if (res.ok) loadPosts();
        else alert("Failed to delete post.");
    } catch (e) {
        alert("Could not reach server.");
    }
}
