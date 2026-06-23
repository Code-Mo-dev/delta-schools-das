// ══════════════════════════════════════════════════════════════
// Delta American Schools — Unified Server
// ══════════════════════════════════════════════════════════════

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const multer     = require('multer');
const nodemailer = require('nodemailer');
const mongoose   = require('mongoose');
const fetch      = require('node-fetch');
const bcrypt     = require('bcryptjs');

const app  = express();
const PORT = process.env.PORT || 3000;

// Root of the DAS project (one level up from /Server)
const ROOT = path.join(__dirname, '..');

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(ROOT));
// On Railway, UPLOADS_DIR points to a persistent Volume (e.g. /data/uploads)
// Locally it falls back to News/uploads inside the project root
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(ROOT, 'News', 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// ─────────────────────────────────────────────────────────────
// MongoDB  (News)
// ─────────────────────────────────────────────────────────────
// Railway MongoDB plugin provides MONGO_URL; fall back to MONGODB_URI then local
const MONGO_CONNECTION =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.MONGODB_URL ||
  'mongodb://localhost:27017/dasdb';

mongoose
  .connect(MONGO_CONNECTION)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => console.error('❌  MongoDB error:', err.message));

const Post = mongoose.model('Post', new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  body:      { type: String, required: true },
  title_ar:  { type: String, default: '', trim: true },
  body_ar:   { type: String, default: '' },
  image:     { type: String, default: null },
  author:    { type: String, required: true, trim: true },
  category:  { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}));

// Course Schema
const Course = mongoose.model('Course', new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  title_ar:       { type: String, default: '', trim: true },
  subject:        { type: String, required: true, trim: true },
  grade:          { type: String, required: true, trim: true },
  description:    { type: String, required: true },
  description_ar: { type: String, default: '' },
  videoUrl:       { type: String, default: '' },
  pdfUrl:         { type: String, default: '' },
  instructor:     { type: String, default: 'DAS Instructor' },
  createdAt:      { type: Date, default: Date.now },
}));

// Student Schema
const Student = mongoose.model('Student', new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  username:  { type: String, required: true, trim: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  grade:     { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}));

// ─────────────────────────────────────────────────────────────
// Multer — News image upload (saved to disk)
// ─────────────────────────────────────────────────────────────
const newsUploadsDir = UPLOADS_DIR;
if (!fs.existsSync(newsUploadsDir)) fs.mkdirSync(newsUploadsDir, { recursive: true });

const newsImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, newsUploadsDir),
    filename:    (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits:     { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
  },
});

// ─────────────────────────────────────────────────────────────
// Multer — Admission file upload (kept in memory)
// ─────────────────────────────────────────────────────────────
const admissionUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ['.pdf', '.zip', '.rar'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext)
      ? cb(null, true)
      : cb(new Error('Only PDF, ZIP, or RAR files are allowed.'));
  },
});

// ─────────────────────────────────────────────────────────────
// Nodemailer — Gmail SMTP
// ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:   465,
  secure: true,
  auth: {
    user: 'codemo2004@gmail.com',
    pass: process.env.GMAIL_APP_PASS,
  },
  connectionTimeout: 5000, // 5 seconds connection timeout
});

// Verify connection configuration in the background so it doesn't block server startup
transporter.verify().then(() => {
  console.log('✅  SMTP ready — codemo2004@gmail.com');
}).catch(err => {
  console.error('❌  SMTP error:', err.message);
});

// ─────────────────────────────────────────────────────────────
// Admin auth  (News)
// ─────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAuth(req, res, next) {
  const token = Buffer.from(ADMIN_PASSWORD).toString('base64');
  if (req.headers.authorization !== 'Bearer ' + token)
    return res.status(401).json({ message: 'Unauthorized' });
  next();
}

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ══════════════════════════════════════════════════════════════
// HTML PAGE ROUTES
// ══════════════════════════════════════════════════════════════
app.get('/',          (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get('/aboutus',   (req, res) => res.sendFile(path.join(ROOT, 'aboutUs', 'aboutUs.html')));
app.get('/services',  (req, res) => res.sendFile(path.join(ROOT, 'services', 'services.html')));
app.get('/news',      (req, res) => res.sendFile(path.join(ROOT, 'News', 'news.html')));
app.get('/admin',     (req, res) => res.sendFile(path.join(ROOT, 'News', 'admin.html')));
app.get('/gallery',   (req, res) => res.sendFile(path.join(ROOT, 'Gallery', 'gallery.html')));
app.get('/admission', (req, res) => res.sendFile(path.join(ROOT, 'admission', 'admission.html')));
app.get('/apply',     (req, res) => res.sendFile(path.join(ROOT, 'sendAdmissionPapers', 'pages', 'send-admission-papers.html')));
app.get('/visit',     (req, res) => res.sendFile(path.join(ROOT, 'SendTheVisitAppointment', 'Send-to-visit.html')));
app.get('/chatbot',   (req, res) => res.sendFile(path.join(ROOT, 'my-chatbot', 'public', 'chatbot.html')));

app.get('/student-login',   (req, res) => res.sendFile(path.join(ROOT, 'courses', 'student-login.html')));
app.get('/courses',         (req, res) => res.sendFile(path.join(ROOT, 'courses', 'courses.html')));
app.get('/courses-admin',   (req, res) => res.sendFile(path.join(ROOT, 'courses', 'courses-admin.html')));

// ══════════════════════════════════════════════════════════════
// COURSES API  →  /api/courses/*
// ══════════════════════════════════════════════════════════════

const INSTRUCTOR_PASSWORD = process.env.INSTRUCTOR_PASSWORD || 'instructor123';
const INSTRUCTOR_TOKEN    = Buffer.from(INSTRUCTOR_PASSWORD).toString('base64');

// ── Student auth (MongoDB + bcrypt) ────────────────────────────
function makeStudentToken(id) {
  return Buffer.from('student:' + id.toString()).toString('base64');
}

function requireInstructor(req, res, next) {
  if (req.headers.authorization !== 'Bearer ' + INSTRUCTOR_TOKEN)
    return res.status(401).json({ message: 'Unauthorized' });
  next();
}

function requireStudent(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    // Allow instructor token for admin preview
    if (decoded.startsWith('student:') || token === INSTRUCTOR_TOKEN) return next();
    return res.status(401).json({ message: 'Unauthorized' });
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// POST /api/courses/instructor-login
app.post('/api/courses/instructor-login', (req, res) => {
  if (req.body.password === INSTRUCTOR_PASSWORD) {
    res.json({ success: true, token: INSTRUCTOR_TOKEN });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password.' });
  }
});

// POST /api/courses/student-register
app.post('/api/courses/student-register', async (req, res) => {
  try {
    const { name, username, password, grade } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ error: 'Name, username and password are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const existing = await Student.findOne({ username: username.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ error: 'Username already taken. Please choose another.' });
    const hashed = await bcrypt.hash(password, 10);
    const student = new Student({ name, username: username.toLowerCase().trim(), password: hashed, grade: grade || '' });
    await student.save();
    res.status(201).json({ success: true, message: 'Account created successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/student-login
app.post('/api/courses/student-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });
    const student = await Student.findOne({ username: username.toLowerCase().trim() });
    if (!student)
      return res.status(401).json({ error: 'Invalid username or password.' });
    const match = await bcrypt.compare(password, student.password);
    if (!match)
      return res.status(401).json({ error: 'Invalid username or password.' });
    res.json({ success: true, token: makeStudentToken(student._id), name: student.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Student Management (instructor only) ───────────────────────

// GET /api/students — list all students
app.get('/api/students', requireInstructor, async (req, res) => {
  try {
    const students = await Student.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/students/:id — update name, username, grade, optionally password
app.put('/api/students/:id', requireInstructor, async (req, res) => {
  try {
    const { name, username, grade, password } = req.body;
    if (!name || !username)
      return res.status(400).json({ error: 'Name and username are required.' });
    // Check username not taken by another student
    const existing = await Student.findOne({ username: username.toLowerCase().trim(), _id: { $ne: req.params.id } });
    if (existing)
      return res.status(409).json({ error: 'Username already taken by another student.' });
    const update = { name, username: username.toLowerCase().trim(), grade: grade || '' };
    if (password && password.trim().length >= 6)
      update.password = await bcrypt.hash(password.trim(), 10);
    const student = await Student.findByIdAndUpdate(req.params.id, update, { new: true, select: '-password' });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/students/:id — delete student account
app.delete('/api/students/:id', requireInstructor, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Student deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/courses/grades  — distinct grade list
app.get('/api/courses/grades', requireStudent, async (req, res) => {
  try { res.json(await Course.distinct('grade')); }
  catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/courses  — all courses (optionally filtered by grade)
app.get('/api/courses', requireStudent, async (req, res) => {
  try {
    const filter = req.query.grade ? { grade: req.query.grade } : {};
    res.json(await Course.find(filter).sort({ grade: 1, createdAt: -1 }));
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/courses  — create course (instructor only)
app.post('/api/courses', requireInstructor, async (req, res) => {
  try {
    const { title, title_ar, subject, grade, description, description_ar, videoUrl, pdfUrl } = req.body;
    const course = new Course({
      title, title_ar: title_ar || '',
      subject, grade,
      description, description_ar: description_ar || '',
      videoUrl, pdfUrl,
      instructor: 'DAS Instructor'
    });
    res.status(201).json(await course.save());
  } catch(err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/courses/:id  — update course (instructor only)
app.put('/api/courses/:id', requireInstructor, async (req, res) => {
  try {
    const { title, title_ar, subject, grade, description, description_ar, videoUrl, pdfUrl } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title, title_ar: title_ar || '', subject, grade,
        description, description_ar: description_ar || '', videoUrl, pdfUrl },
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch(err) { res.status(400).json({ error: err.message }); }
});

// DELETE /api/courses/:id  — delete course (instructor only)
app.delete('/api/courses/:id', requireInstructor, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// POST /send-admission  — Admission email with file attachment
// ══════════════════════════════════════════════════════════════
app.post('/send-admission', admissionUpload.single('file'), async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone)
      return res.status(400).json({ error: 'Name, email and phone are required.' });
    if (!req.file)
      return res.status(400).json({ error: 'A document file is required.' });

    await transporter.sendMail({
      from:    '"Delta American Schools Website" <codemo2004@gmail.com>',
      to:      'codemo2004@gmail.com',
      replyTo: email,
      subject: `📋 New Admission Application — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nFile: ${req.file.originalname}`,
      html: `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;color:#1a1208;">
          <div style="background:#1a1208;padding:24px 32px;text-align:center;">
            <h1 style="color:#f5f0e8;font-size:22px;margin:0;">Delta American Schools</h1>
            <p style="color:rgba(245,240,232,.55);font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin:6px 0 0;">New Admission Application</p>
          </div>
          <div style="border:1px solid #c8b89a;border-top:none;padding:32px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:10px 0;color:#7a6e5f;width:110px;font-size:11px;text-transform:uppercase;">Name</td>
                <td style="padding:10px 0;font-weight:600;">${escapeHtml(name)}</td>
              </tr>
              <tr style="border-top:1px solid #ede8dc;">
                <td style="padding:10px 0;color:#7a6e5f;font-size:11px;text-transform:uppercase;">Email</td>
                <td style="padding:10px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#8b2020;">${escapeHtml(email)}</a></td>
              </tr>
              <tr style="border-top:1px solid #ede8dc;">
                <td style="padding:10px 0;color:#7a6e5f;font-size:11px;text-transform:uppercase;">Phone</td>
                <td style="padding:10px 0;">${escapeHtml(phone)}</td>
              </tr>
              <tr style="border-top:1px solid #ede8dc;">
                <td style="padding:10px 0;color:#7a6e5f;font-size:11px;text-transform:uppercase;">File</td>
                <td style="padding:10px 0;">${escapeHtml(req.file.originalname)}</td>
              </tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#ede8dc;border-left:3px solid #8b2020;">
              <p style="margin:0;font-size:13px;color:#7a6e5f;font-style:italic;">
                The submitted documents are attached. Please review and follow up with the applicant.
              </p>
            </div>
          </div>
          <div style="padding:16px 32px;text-align:center;border-top:1px solid #c8b89a;">
            <p style="font-size:11px;color:#7a6e5f;text-transform:uppercase;margin:0;">
              © ${new Date().getFullYear()} Delta American Schools · Mansoura, Egypt
            </p>
          </div>
        </div>
      `,
      attachments: [{
        filename:    req.file.originalname,
        content:     req.file.buffer,
        contentType: req.file.mimetype,
      }],
    });

    console.log(`📧  Admission email sent — ${name} <${email}>`);
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌  Admission error:', err.message);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════
// POST /send-visit  — Visit booking email
// ══════════════════════════════════════════════════════════════
app.post('/send-visit', async (req, res) => {
  try {
    const { name, phone, date, notes } = req.body;

    if (!name || !phone || !date)
      return res.status(400).json({ error: 'Name, phone and date are required.' });

    const formatted = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    await transporter.sendMail({
      from:    '"Delta American Schools Website" <codemo2004@gmail.com>',
      to:      'codemo2004@gmail.com',
      subject: `📅 New Campus Visit Request — ${name} · ${formatted}`,
      text:    `Name: ${name}\nPhone: ${phone}\nDate: ${formatted}\nNotes: ${notes || 'None'}`,
      html: `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;color:#1a1208;">
          <div style="background:#1a1208;padding:24px 32px;text-align:center;">
            <h1 style="color:#f5f0e8;font-size:22px;margin:0;">Delta American Schools</h1>
            <p style="color:rgba(245,240,232,.55);font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin:6px 0 0;">New Campus Visit Request</p>
          </div>
          <div style="border:1px solid #c8b89a;border-top:none;padding:32px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:10px 0;color:#7a6e5f;width:110px;font-size:11px;text-transform:uppercase;">Name</td>
                <td style="padding:10px 0;font-weight:600;">${escapeHtml(name)}</td>
              </tr>
              <tr style="border-top:1px solid #ede8dc;">
                <td style="padding:10px 0;color:#7a6e5f;font-size:11px;text-transform:uppercase;">Phone</td>
                <td style="padding:10px 0;">${escapeHtml(phone)}</td>
              </tr>
              <tr style="border-top:1px solid #ede8dc;">
                <td style="padding:10px 0;color:#7a6e5f;font-size:11px;text-transform:uppercase;">Visit Date</td>
                <td style="padding:10px 0;color:#8b2020;font-weight:600;">${escapeHtml(formatted)}</td>
              </tr>
              ${notes ? `
              <tr style="border-top:1px solid #ede8dc;">
                <td style="padding:10px 0;color:#7a6e5f;font-size:11px;text-transform:uppercase;vertical-align:top;">Notes</td>
                <td style="padding:10px 0;font-style:italic;">${escapeHtml(notes)}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top:24px;padding:16px;background:#ede8dc;border-left:3px solid #8b2020;">
              <p style="margin:0;font-size:13px;color:#7a6e5f;font-style:italic;">
                Please contact the visitor to confirm their appointment.
              </p>
            </div>
          </div>
          <div style="padding:16px 32px;text-align:center;border-top:1px solid #c8b89a;">
            <p style="font-size:11px;color:#7a6e5f;text-transform:uppercase;margin:0;">
              © ${new Date().getFullYear()} Delta American Schools · Mansoura, Egypt
            </p>
          </div>
        </div>
      `,
    });

    console.log(`📅  Visit booking email sent — ${name}, date: ${formatted}`);
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌  Visit booking error:', err.message);
    res.status(500).json({ error: 'Failed to send booking. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════
// POST /chat  — AI Chatbot (Groq)
// ══════════════════════════════════════════════════════════════
app.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message)
    return res.status(400).json({ error: 'Message is required.' });

  const SYSTEM_PROMPT = `
You are the official AI assistant for Delta American Schools (DAS), located in Mansoura, Egypt.
You answer questions from parents, students, and visitors in a friendly, professional, and informative tone.
You respond in the same language the user writes in — if they write in Arabic, respond in Arabic; if in English, respond in English.
Always use clear formatting: use bullet points, numbered lists, and section headers where appropriate to make answers easy to read.
Never invent information. If you don't know something specific, say so politely and suggest contacting the school directly.

══════════════════════════════════════
SCHOOL OVERVIEW
══════════════════════════════════════
- Full name: Delta American Schools (DAS)
- Location: Delta Academy Campus, Highway Mansoura–Damietta, Dakahlia Governorate, Egypt
- Founded: 2011 (parent group: Delta Educational Group, est. 1996)
- Type: Private international school
- Language of instruction: English (American curriculum)
- Phone: +201090700727 / +201066276898
- Email: info@delta.edu.eg
- Website: https://code-mo-dev.github.io/delta-school/

══════════════════════════════════════
ACCREDITATIONS & ACHIEVEMENTS
══════════════════════════════════════
- Accredited by the Egyptian Ministry of Education
- Accredited by Cognia (formerly AdvancED) — a prestigious international education quality body since 2013
- Entered the Guinness Book of World Records in 2022 — a historic milestone for the school
- Students achieved top scores in ACT and SAT international examinations in 2023

══════════════════════════════════════
CURRICULUM
══════════════════════════════════════
- American-based curriculum focused on skills development
- Common Core Standards (Mathematics & English Language Arts)
- NGSS — Next Generation Science Standards (Science)
- Focus on social-emotional development, critical thinking, creativity, and global citizenship

══════════════════════════════════════
ACADEMIC LEVELS
══════════════════════════════════════
Stage I — Kindergarten (KG):
  • KG Prep (Pre-Kindergarten)
  • KG 1 (Kindergarten Level 1)
  • KG 2 (Kindergarten Level 2)

Stage II — Primary (Grades 1–6):
  • Primary Grades 1 through 6

Stage III — Preparatory (Grades 7–9):
  • Preparatory Grades 1 through 3

Stage IV — Secondary (Grades 10–12):
  • Secondary Grades 1 through 3

══════════════════════════════════════
TUITION FEES (Academic Year 2025–2026)
══════════════════════════════════════
- KG (KG Prep, KG 1, KG 2): EGP 68,600 per year
- Primary (Grades 1–6):      EGP 67,380 per year
- Preparatory (Grades 7–9):  EGP 70,820 per year
- Secondary (Grades 10–12):  EGP 81,150 per year

Additional fees (may vary):
  • Activity fees
  • Transportation fees
  • Textbook fees
  • School uniform fees
  • Application form fees (refundable if student is not accepted)

Note: Fees are subject to change. Always confirm with the admissions office.

══════════════════════════════════════
ADMISSION REQUIREMENTS
══════════════════════════════════════
Minimum age: 3 years and 6 months (for KG entry)
Applications open: February of each year
Placement test: Required for all applicants (English, Mathematics, Arabic)
Parent interview: Required with school administration

Required documents for all stages:
  1. Original computerized birth certificate (recent)
  2. 8 recent passport-sized photos (white background)
  3. Valid National ID copies of both parents
  4. University degree copies for both parents
  5. For non-Egyptians: student and parent passports with valid residency permit

Additional documents for transfer students:
  1. Official transcript from last academic year (stamped by Educational Directorate)
  2. Withdrawal of student file from previous school (after acceptance letter)
  3. Certificate of Good Conduct (sometimes required for preparatory/secondary)

Admission procedure:
  1. Fill out application form (online or at school)
  2. Schedule entrance exam
  3. Attend parent interview

To apply: https://code-mo-dev.github.io/delta-school/sendAdmissionPapers/pages/send-admission-papers.html

══════════════════════════════════════
SCHOOL SERVICES
══════════════════════════════════════
1. Submit Admission Papers — upload required documents electronically
2. AI Assistant — 24/7 instant answers (you are using this now)
3. Contact & Support — direct communication with admissions team and parent services
4. Book a School Visit — schedule a campus tour (Sun–Thu, 8:00 AM – 2:00 PM)
5. Online Courses — students can access video lessons and PDF materials by grade level

══════════════════════════════════════
FOUNDERS
══════════════════════════════════════
Dr. Mohamed Rabie Nasser — Chairman, Board of Trustees
  • Pioneer of private education in Egypt
  • Chairman of Delta University for Science and Technology
  • Founder of Delta Academy, Sphinx University, and Nile Valley University
  • Established the Mohamed Rabie Award for Scientific Research

Dr. Ahmed Abu El-Fotouh — Dean, Delta Higher Institute
  • Academic professor and Dean of the Delta Higher Institute for Computer Science
  • Key educational leader in the Delta group
  • Oversees engineering departments and scientific research system

Maj. Gen. Dr. Abdul Wahab Al-Ra'i — Security Expert & Senior Academic
  • 30-year career in the Ministry of Interior specializing in organized crime
  • Presidential Medal of Excellence recipient
  • Authority on intellectual security and legal legislation

══════════════════════════════════════
FACULTY HIGHLIGHTS
══════════════════════════════════════
- Ms. Eman Nour — Humanities Department
- Ms. Mona Elghobary — Physical Education Department
- Ms. Haidy Elkazaz — French Language Department
- Ms. Taghreed Reda — Art Department

══════════════════════════════════════
WHY CHOOSE DELTA AMERICAN SCHOOLS
══════════════════════════════════════
1. Continuous development — committed to evolving the education system
2. Expert educators — top instructors focused on exceptional learning outcomes
3. Safe campus — monitored by security cameras throughout
4. Student activities — encourage creativity, teamwork, and learning
5. International accreditation — Cognia certified for quality standards

══════════════════════════════════════
CONTACT & LOCATION
══════════════════════════════════════
- Phone: +201090700727
- Phone: +201066276898
- Email: info@delta.edu.eg
- Address: Delta Academy, Highway Mansoura–Damietta, Dakahlia, Egypt
- Facebook: https://www.facebook.com/Delta.A.S/
- Instagram: https://www.instagram.com/deltaamericanschool/
- LinkedIn: https://www.linkedin.com/company/delta-american-school/
- Map: https://maps.app.goo.gl/QQPrtHqdyHhDpDFX9
- Campus visits: Sunday–Thursday, 8:00 AM – 2:00 PM
- Book a visit: https://code-mo-dev.github.io/delta-school/SendTheVisitAppointment/Send-to-visit.html
`.trim();

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  if (Array.isArray(history)) {
    history.forEach(turn => messages.push({
      role:    turn.role === 'bot' ? 'assistant' : 'user',
      content: turn.text,
    }));
  }

  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages,
        max_tokens:  1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌  Groq error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Groq API error.' });
    }

    res.json({ reply: data.choices?.[0]?.message?.content || 'No response generated.' });

  } catch (err) {
    console.error('❌  Chatbot error:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ══════════════════════════════════════════════════════════════
// NEWS API  →  /api/*
// ══════════════════════════════════════════════════════════════

app.post('/api/auth/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    res.json({ success: true, token: Buffer.from(ADMIN_PASSWORD).toString('base64') });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    res.json(await Post.find(filter).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    res.json(await Post.distinct('category'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/posts', requireAuth, newsImageUpload.single('image'), async (req, res) => {
  try {
    const { title, body, title_ar, body_ar, author, category } = req.body;
    const post = new Post({
      title, body,
      title_ar: title_ar || '',
      body_ar:  body_ar  || '',
      author, category,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });
    res.status(201).json(await post.save());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.image) {
      const filePath = path.join(ROOT, 'News', post.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Multer error handler
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ error: 'File too large.' });
  if (err)
    return res.status(400).json({ error: err.message });
  next();
});

// ─────────────────────────────────────────────────────────────
// Start — only ONE app.listen()
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
🚀  DAS Unified Server running on http://localhost:${PORT}

  🏠  http://localhost:${PORT}/             →  Home
  👥  http://localhost:${PORT}/aboutus      →  About Us
  ⚙️   http://localhost:${PORT}/services     →  Services
  📰  http://localhost:${PORT}/news         →  News
  🖼️   http://localhost:${PORT}/gallery      →  Gallery
  📋  http://localhost:${PORT}/admission    →  Admission
  📝  http://localhost:${PORT}/apply        →  Send Admission Papers
  📅  http://localhost:${PORT}/visit        →  Book a Visit
  🤖  http://localhost:${PORT}/chatbot      →  AI Chatbot
  🔐  http://localhost:${PORT}/admin        →  News Admin
  🎓  http://localhost:${PORT}/student-login →  Student Login
  📚  http://localhost:${PORT}/courses      →  Courses (students)
  👨‍🏫  http://localhost:${PORT}/courses-admin →  Courses Admin (instructors)

  POST /send-admission  →  admission email
  POST /send-visit      →  visit booking email
  POST /chat            →  AI chatbot
  GET  /api/posts       →  news posts
  POST /api/auth/login  →  admin login
  `);
});
