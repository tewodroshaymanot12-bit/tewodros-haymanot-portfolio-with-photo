(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('#toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // Mobile navigation
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mainNav.classList.toggle('open', open);
  });
  $$('.main-nav a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  // Theme toggle with local persistence
  const themeToggle = $('#themeToggle');
  const themeIcon = $('#themeIcon');
  const savedTheme = localStorage.getItem('tewodros-portfolio-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;
  function updateThemeIcon() {
    const light = document.documentElement.dataset.theme === 'light';
    themeIcon.textContent = light ? '☾' : '☼';
    themeToggle.title = light ? 'Switch to dark theme' : 'Switch to light theme';
  }
  updateThemeIcon();
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('tewodros-portfolio-theme', next);
    updateThemeIcon();
  });

  // Scroll progress and active navigation
  const progress = $('#scrollProgress');
  function updateScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
  const navLinks = $$('.nav-link');
  const sections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Reveal animations, with reduced-motion support
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('in-view'));
  }

  // Animated stats count up when visible
  const counters = $$('[data-count]');
  function animateCounter(el) {
    const target = Number(el.dataset.count) || 0;
    const duration = 1000;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.floor(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
    }), { threshold: .5 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else counters.forEach(counter => { counter.textContent = counter.dataset.count; });
  $('#year').textContent = new Date().getFullYear();

  // Project filtering
  const projectCards = $$('.project-card');
  const filterButtons = $$('.filter-button');
  function updateProjectCount() {
    const count = projectCards.filter(card => !card.hidden).length;
    $('#projectCount').textContent = `SHOWING ${String(count).padStart(2, '0')} PROJECT${count === 1 ? '' : 'S'}`;
  }
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    const filter = button.dataset.filter;
    projectCards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
    updateProjectCount();
  }));

  // Contact form: front-end validation/demo only; no message is sent without a backend.
  const contactForm = $('#contactForm');
  const formNote = $('#formNote');
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();
    const emailOkay = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    formNote.className = 'form-note error';
    if (name.length < 2) { formNote.textContent = 'Please enter your name (at least 2 characters).'; return; }
    if (!emailOkay) { formNote.textContent = 'Please enter a valid email address.'; return; }
    if (!subject) { formNote.textContent = 'Please select a topic.'; return; }
    if (message.length < 10) { formNote.textContent = 'Please add a message of at least 10 characters.'; return; }
    const submissions = JSON.parse(localStorage.getItem('tewodros-portfolio-messages') || '[]');
    submissions.push({ name, email, subject, message, createdAt: new Date().toISOString() });
    localStorage.setItem('tewodros-portfolio-messages', JSON.stringify(submissions));
    contactForm.reset();
    formNote.className = 'form-note success';
    formNote.textContent = 'Demo saved locally. Connect a backend to deliver real emails.';
    showToast('Your demo message was saved in this browser. No email was sent.');
  });

  // Modal helpers
  const authModal = $('#authModal');
  const adminModal = $('#adminModal');
  let previousFocus = null;
  function openModal(modal) {
    previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const focusable = $('input:not([type="hidden"]), button:not([data-close-modal])', modal);
    if (focusable) setTimeout(() => focusable.focus(), 20);
  }
  function closeModal(modal) {
    modal.hidden = true;
    if (authModal.hidden && adminModal.hidden) document.body.classList.remove('modal-open');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }
  $$('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop'))));
  [authModal, adminModal].forEach(modal => modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!authModal.hidden) closeModal(authModal);
      if (!adminModal.hidden) closeModal(adminModal);
    }
  });
  $('#openAuth').addEventListener('click', () => { setAuthMode('login'); openModal(authModal); });

  // Local-only demo authentication. This is intentionally not production security.
  let authMode = 'login';
  function setAuthMode(mode) {
    authMode = mode;
    $$('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === mode));
    const nameField = $('.auth-name-field');
    nameField.hidden = mode !== 'register';
    $('input[name="fullName"]', nameField).required = mode === 'register';
    $('#authTitle').textContent = mode === 'login' ? 'Welcome back.' : 'Create your account.';
    $('#authSubmit').innerHTML = mode === 'login' ? 'Sign in <span>↗</span>' : 'Create account <span>↗</span>';
    $('#authMessage').textContent = '';
    $('#authMessage').className = 'auth-message';
  }
  $$('.auth-tab').forEach(tab => tab.addEventListener('click', () => setAuthMode(tab.dataset.authTab)));
  $('#authForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(form.elements.authEmail.value || '').trim().toLowerCase();
    const password = String(form.elements.password.value || '');
    const message = $('#authMessage');
    const setMessage = (text, success = false) => { message.textContent = text; message.className = success ? 'auth-message success' : 'auth-message'; };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage('Enter a valid email address.'); return; }
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return; }
    const accounts = JSON.parse(localStorage.getItem('tewodros-portfolio-demo-accounts') || '[]');
    if (authMode === 'register') {
      const fullName = String(form.elements.fullName.value || '').trim();
      if (fullName.length < 2) { setMessage('Enter your name.'); return; }
      if (accounts.some(account => account.email === email)) { setMessage('That demo email is already registered.'); return; }
      accounts.push({ name: fullName, email, password });
      localStorage.setItem('tewodros-portfolio-demo-accounts', JSON.stringify(accounts));
      setMessage('Demo account created. You can now sign in.', true);
      showToast('Demo account created locally.');
      setTimeout(() => { setAuthMode('login'); form.elements.authEmail.value = email; form.elements.password.value = ''; }, 900);
      return;
    }
    const account = accounts.find(item => item.email === email && item.password === password);
    if (!account) { setMessage('Demo account not found. Register first, or use the admin demo below.'); return; }
    setMessage(`Welcome, ${account.name}. Signed in locally.`, true);
    showToast(`Welcome, ${account.name}. This is a local demo session.`);
    setTimeout(() => closeModal(authModal), 1000);
  });

  // Admin demo access: the button is intentionally inside the client portal flow.
  // A user can enter demo credentials to access the local portfolio editor.
  const authForm = $('#authForm');
  const adminAccess = document.createElement('button');
  adminAccess.type = 'button';
  adminAccess.className = 'text-link admin-access-link';
  adminAccess.style.cssText = 'width:100%;justify-content:center;border:0;background:none;margin-top:13px;cursor:pointer';
  adminAccess.textContent = 'Open portfolio admin demo ↗';
  authForm.after(adminAccess);
  adminAccess.addEventListener('click', () => {
    closeModal(authModal);
    renderAdminProjects();
    openModal(adminModal);
  });

  const defaultProjects = [
    { id: 'pulse', title: 'Pulse Analytics', category: 'web', description: 'A clean analytics dashboard that transforms complex data into clear, actionable insights.' },
    { id: 'daymark', title: 'Daymark', category: 'app', description: 'A habit tracker built around small wins and sustainable routines.' },
    { id: 'bloom', title: 'Bloom Studio', category: 'design', description: 'A warm, minimal identity for a contemporary botanical studio.' },
    { id: 'form', title: 'Form & Function', category: 'web', description: 'A considered storefront for everyday objects and independent makers.' },
    { id: 'atmos', title: 'Atmos', category: 'app', description: 'A calm, location-aware weather experience with a clear visual forecast.' },
    { id: 'learnly', title: 'Learnly', category: 'design', description: 'A focused learning dashboard designed to make progress feel achievable.' }
  ];
  function getAdminProjects() {
    try {
      const stored = JSON.parse(localStorage.getItem('tewodros-portfolio-admin-projects') || 'null');
      return Array.isArray(stored) ? stored : defaultProjects.map(project => ({ ...project }));
    } catch { return defaultProjects.map(project => ({ ...project })); }
  }
  function saveAdminProjects(projects) { localStorage.setItem('tewodros-portfolio-admin-projects', JSON.stringify(projects)); }
  function renderAdminProjects() {
    const projects = getAdminProjects();
    $('#adminProjectCount').textContent = String(projects.length);
    const list = $('#adminProjectList');
    list.replaceChildren();
    if (!projects.length) {
      const empty = document.createElement('p'); empty.className = 'demo-note'; empty.textContent = 'No demo projects yet. Use the form above to add one.'; list.append(empty); return;
    }
    projects.forEach(project => {
      const row = document.createElement('div'); row.className = 'admin-project-row';
      const info = document.createElement('div');
      const title = document.createElement('b'); title.textContent = project.title;
      const meta = document.createElement('small'); meta.textContent = `${project.category.toUpperCase()} · ${project.description}`;
      info.append(title, meta);
      const remove = document.createElement('button'); remove.className = 'delete-project'; remove.type = 'button'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${project.title}`);
      remove.addEventListener('click', () => {
        const updated = getAdminProjects().filter(item => item.id !== project.id);
        saveAdminProjects(updated); renderAdminProjects(); showToast('Project removed from the local admin list.');
      });
      row.append(info, remove); list.append(row);
    });
  }
  $('#projectForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = String(form.elements.title.value || '').trim();
    const category = String(form.elements.category.value || 'web');
    const description = String(form.elements.description.value || '').trim();
    if (title.length < 2 || description.length < 5) { showToast('Add a title and a description of at least 5 characters.'); return; }
    const projects = getAdminProjects();
    projects.unshift({ id: `project-${Date.now()}`, title, category, description });
    saveAdminProjects(projects);
    form.reset(); renderAdminProjects(); showToast('Project added to the local admin list.');
  });
  $('#adminSignOut').addEventListener('click', () => closeModal(adminModal));

  // The demo admin editor updates its own list. Existing portfolio cards are sample markup;
  // a real deployment should connect these actions to an authenticated backend/database.
})();
