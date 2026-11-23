export const STARTER_COMPONENTS = [
  {
    id: 101,
    componentType: "Navigation Bar",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt: "Responsive Bootstrap navigation bar for Atelier Botanica",
    code: `<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#" style="color:#7557F6;">Atelier Botanica</a>
    <div class="d-flex align-items-center gap-4">
      <a class="nav-link text-secondary fw-medium" href="#hero">Home</a>
      <a class="nav-link text-secondary fw-medium" href="#cards">Products</a>
      <a class="nav-link text-secondary fw-medium" href="#contact">Contact</a>
      <a class="btn text-white px-4" style="background:#7557F6;" href="#contact">Shop Now</a>
    </div>
  </div>
</nav>`
  },
  {
    id: 102,
    componentType: "Hero Section",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt: "Modern hero section for a botanical skincare brand",
    code: `<section id="hero" class="py-5 bg-light border-bottom">
  <div class="container py-4">
    <div class="row align-items-center g-4">
      <div class="col-lg-6">
        <p class="text-uppercase small fw-bold mb-2" style="color:#7557F6;">Botanical Formulations</p>
        <h1 class="display-5 fw-bold text-dark mb-3">Gentle daily skincare rooted in cold-pressed plants.</h1>
        <p class="lead text-secondary mb-4">Small-batch serums and barrier creams crafted without synthetic fragrance.</p>
        <div class="d-flex gap-3">
          <a href="#cards" class="btn btn-lg text-white px-4" style="background:#7557F6;">Explore Collection</a>
          <a href="#contact" class="btn btn-lg btn-outline-secondary px-4">Book Consultation</a>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="bg-white border rounded-4 p-4 shadow-sm">
          <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg" class="w-100 h-auto">
            <rect width="420" height="260" rx="12" fill="#F5F3FF" />
            <rect x="40" y="42" width="140" height="176" rx="12" fill="#7557F6" opacity="0.18" />
            <rect x="76" y="70" width="68" height="120" rx="10" fill="#7557F6" />
            <rect x="208" y="64" width="160" height="18" rx="6" fill="#1E293B" />
            <rect x="208" y="96" width="136" height="12" rx="4" fill="#64748B" />
            <rect x="208" y="118" width="120" height="12" rx="4" fill="#94A3B8" />
            <rect x="208" y="156" width="110" height="36" rx="8" fill="#7557F6" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 103,
    componentType: "Feature Cards",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt: "Three responsive feature cards for skincare benefits",
    code: `<section id="cards" class="py-5 bg-white">
  <div class="container">
    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm p-3">
          <div class="card-body">
            <p class="small fw-semibold mb-2" style="color:#7557F6;">01 · Hydration</p>
            <h3 class="h5 fw-bold text-dark">Barrier Repair Serum</h3>
            <p class="text-secondary small mb-0">Ceramide-rich botanical blend formulated to calm redness and lock in moisture.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm p-3">
          <div class="card-body">
            <p class="small fw-semibold mb-2" style="color:#7557F6;">02 · Clarity</p>
            <h3 class="h5 fw-bold text-dark">Vitamin C Concentrate</h3>
            <p class="text-secondary small mb-0">Stabilized antioxidant drops that brighten uneven skin tone without irritation.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm p-3">
          <div class="card-body">
            <p class="small fw-semibold mb-2" style="color:#7557F6;">03 · Protection</p>
            <h3 class="h5 fw-bold text-dark">Daily Mineral Fluid</h3>
            <p class="text-secondary small mb-0">Weightless broad-spectrum SPF 40 with a sheer, non-greasy matte finish.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 104,
    componentType: "Contact Form",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt: "Clean Bootstrap contact form with name, email, and submit feedback",
    code: `<section id="contact" class="py-5 bg-light border-top">
  <div class="container" style="max-width: 640px;">
    <div class="card border shadow-sm p-4">
      <div class="card-body">
        <h2 class="h4 fw-bold text-dark mb-2">Book a Skincare Consultation</h2>
        <p class="text-secondary small mb-4">Tell us your skin goals and we will send a tailored routine guide.</p>
        <form onsubmit="event.preventDefault(); document.getElementById('contact-alert').classList.remove('d-none');">
          <div class="mb-3">
            <label class="form-label small fw-semibold">Full Name</label>
            <input type="text" class="form-control" required placeholder="Jane Doe" />
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Email Address</label>
            <input type="email" class="form-control" required placeholder="jane@example.com" />
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Message</label>
            <textarea class="form-control" rows="3" required placeholder="Share your routine questions..."></textarea>
          </div>
          <button type="submit" class="btn text-white px-4" style="background:#7557F6;">Send Message</button>
          <div id="contact-alert" class="alert alert-success mt-3 d-none" role="alert">
            Thank you! Your message has been received.
          </div>
        </form>
      </div>
    </div>
  </div>
</section>`
  }
];

export const LIBRARY_PRESETS = [
  {
    componentType: "Navigation Bar",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt:
      "Create a responsive Bootstrap 5 navigation bar with a brand logo, 4 clean links, and a highlighted Sign Up button."
  },
  {
    componentType: "Hero Section",
    framework: "HTML & CSS",
    designStyle: "Minimal",
    primaryColor: "#2563EB",
    prompt:
      "Create a clean two-column hero section for a student developer portfolio with headline, bio summary, CTA button, and an inline SVG graphic."
  },
  {
    componentType: "Feature Cards",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#0D9488",
    prompt:
      "Create a 3-column responsive Bootstrap card grid showcasing web design, frontend development, and cloud deployment services."
  },
  {
    componentType: "Contact Form",
    framework: "HTML & CSS",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt:
      "Create a clean accessible contact form with name, email, project type dropdown, message box, and a styled submit button."
  }
];
