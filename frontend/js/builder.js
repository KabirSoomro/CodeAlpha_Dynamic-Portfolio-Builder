/* ============================================================
   builder.js — Core Builder Logic
   
   This is the most complex file in the project. I handle:
   1. Auth guard
   2. Loading existing portfolio data from the API
   3. Populating all form fields from the loaded data
   4. Real-time DOM binding: input events → live preview updates
   5. Dynamic field management (add/remove Experience, Education, Projects)
   6. Skills pill management (add/remove/Enter key)
   7. Debounced auto-save (PATCH /api/portfolio)
   8. Section tab navigation
   9. Theme color picker
   10. URL param detection for "?action=pdf"
============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  // ── Auth Guard ────────────────────────────────────────────────
  Auth.requireAuth();

  // ── State Object ──────────────────────────────────────────────
  // I maintain a single in-memory state object that mirrors the
  // MongoDB portfolio document. All form inputs write to this
  // state, and all preview DOM updates read from it.
  // I start with safe defaults so the preview never shows undefined.
  let state = {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    avatarUrl: '',
    social: { github: '', linkedin: '', twitter: '', website: '' },
    experience: [],
    education: [],
    projects: [],
    techStack: [],
    themeColor: '#6c63ff',
  };

  // ── DOM References ────────────────────────────────────────────
  const saveDot = document.getElementById('save-dot');
  const saveText = document.getElementById('save-status-text');

  // ── Load Existing Portfolio ───────────────────────────────────
  const res = await apiFetch('/portfolio/me');
  if (res?.success && res.portfolio) {
    // I deep-merge the API data into state to fill any missing
    // fields with their default values.
    state = { ...state, ...res.portfolio };
    // I ensure nested objects are properly merged
    state.social = { ...state.social, ...(res.portfolio.social || {}) };
  }

  // ── Handle Template Selection ─────────────────────────────────
  const templateSelector = document.getElementById('template-selector');
  if (templateSelector) {
    templateSelector.addEventListener('change', (e) => {
      const templateClass = e.target.value;
      state.template = templateClass;
      applyTemplate(templateClass);
      scheduleSave();
    });
  }

  function applyTemplate(templateClass) {
    const resumeEl = document.getElementById('resume-preview');
    if (!resumeEl) return;

    // Remove existing template classes
    resumeEl.classList.remove(
      'template-modern',
      'template-sidebar',
      'template-minimal',
      'template-executive',
      'template-creative',
      'template-tech'
    );
    resumeEl.classList.add(templateClass);

    if (templateSelector) {
      templateSelector.value = templateClass;
    }
  }

  // ── Apply Theme Color ─────────────────────────────────────────
  applyThemeColor(state.themeColor || '#6c63ff');

  // ── Populate Form Fields ──────────────────────────────────────
  // I use data-field attributes on inputs to know which state
  // key they map to. I support dot notation for nested fields
  // like "social.github".
  populateFormFields();

  // ── Render Preview ────────────────────────────────────────────
  renderFullPreview();

  // ── Render Dynamic Lists ──────────────────────────────────────
  renderExperienceList();
  renderEducationList();
  renderProjectsList();
  renderSkillsPills();

  // ── Check for ?action=pdf URL Parameter ──────────────────────
  // I detect this param so the dashboard "Download PDF" shortcut
  // can redirect here and auto-trigger the export.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'pdf') {
    // I wait a tick so the DOM renders first
    setTimeout(() => window.pdf?.downloadPDF(), 500);
  }

  // ══════════════════════════════════════════════════════════════
  //  SECTION TAB NAVIGATION
  // ══════════════════════════════════════════════════════════════

  const editorTabs = document.querySelectorAll('.editor-tab');
  const editorSections = document.querySelectorAll('.editor-section');

  editorTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.section;

      editorTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      editorSections.forEach((s) => s.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const activeSection = document.getElementById(`section-${target}`);
      if (activeSection) {
        activeSection.classList.add('active');
        // Scroll the editor back to the top when switching tabs
        const editorWrapper = document.querySelector('.builder-editor');
        if (editorWrapper) {
          editorWrapper.scrollTop = 0;
          window.scrollTo(0, 0);
        }
      }
    });
  });

  // ══════════════════════════════════════════════════════════════
  //  REAL-TIME DATA BINDING — Personal Info Fields
  // ══════════════════════════════════════════════════════════════

  // I delegate all personal-section input events to the section
  // element instead of attaching per-input listeners. This means
  // dynamically added fields also get bound automatically.
  document.getElementById('section-personal').addEventListener('input', (e) => {
    const el = e.target;
    const field = el.dataset.field;
    if (!field) return;

    const value = el.value;

    // I handle dot-notation fields like "social.github"
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      state[parent] = state[parent] || {};
      state[parent][child] = value;
    } else {
      state[field] = value;
    }

    // I immediately update only the affected preview element
    // instead of re-rendering the entire preview — zero latency.
    updatePreviewField(field, value);
    scheduleSave();
  });

  // ══════════════════════════════════════════════════════════════
  //  AVATAR FILE UPLOAD
  // ══════════════════════════════════════════════════════════════

  const avatarFileInput = document.getElementById('inp-avatar-file');
  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        state.avatarUrl = base64String;

        // Also clear the URL input to avoid confusion
        const urlInput = document.getElementById('inp-avatar');
        if (urlInput) urlInput.value = '';

        updatePreviewField('avatarUrl', base64String);
        scheduleSave();
      };
      reader.readAsDataURL(file);
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  DYNAMIC FIELDS — Experience
  // ══════════════════════════════════════════════════════════════

  document.getElementById('add-experience-btn').addEventListener('click', () => {
    state.experience.push({
      jobTitle: '', company: '', location: '',
      startDate: '', endDate: '', description: '', isCurrent: false,
    });
    renderExperienceList();
    scheduleSave();
  });

  function renderExperienceList() {
    const container = document.getElementById('experience-list');
    container.innerHTML = '';

    state.experience.forEach((exp, index) => {
      const entry = createDynamicEntry(
        `Experience ${index + 1}`,
        index,
        'experience',
        [
          { id: `exp-jobtitle-${index}`, label: 'Job Title', key: 'jobTitle', type: 'text', value: exp.jobTitle },
          { id: `exp-company-${index}`, label: 'Company', key: 'company', type: 'text', value: exp.company },
          { id: `exp-location-${index}`, label: 'Location', key: 'location', type: 'text', value: exp.location },
          { id: `exp-start-${index}`, label: 'Start Date', key: 'startDate', type: 'month', value: exp.startDate },
          { id: `exp-end-${index}`, label: 'End Date', key: 'endDate', type: 'month', value: exp.endDate },
          { id: `exp-desc-${index}`, label: 'Description', key: 'description', type: 'textarea', value: exp.description },
        ]
      );
      container.appendChild(entry);
    });

    updatePreviewExperience();
  }

  // ══════════════════════════════════════════════════════════════
  //  DYNAMIC FIELDS — Education
  // ══════════════════════════════════════════════════════════════

  document.getElementById('add-education-btn').addEventListener('click', () => {
    state.education.push({
      degree: '', institution: '', fieldOfStudy: '',
      startDate: '', endDate: '', grade: '', description: '',
    });
    renderEducationList();
    scheduleSave();
  });

  function renderEducationList() {
    const container = document.getElementById('education-list');
    container.innerHTML = '';

    state.education.forEach((edu, index) => {
      const entry = createDynamicEntry(
        `Education ${index + 1}`,
        index,
        'education',
        [
          { id: `edu-degree-${index}`, label: 'Degree', key: 'degree', type: 'text', value: edu.degree },
          { id: `edu-inst-${index}`, label: 'Institution', key: 'institution', type: 'text', value: edu.institution },
          { id: `edu-field-${index}`, label: 'Field of Study', key: 'fieldOfStudy', type: 'text', value: edu.fieldOfStudy },
          { id: `edu-start-${index}`, label: 'Start Date', key: 'startDate', type: 'month', value: edu.startDate },
          { id: `edu-end-${index}`, label: 'End Date', key: 'endDate', type: 'month', value: edu.endDate },
          { id: `edu-grade-${index}`, label: 'Grade / GPA', key: 'grade', type: 'text', value: edu.grade },
        ]
      );
      container.appendChild(entry);
    });

    updatePreviewEducation();
  }

  // ══════════════════════════════════════════════════════════════
  //  DYNAMIC FIELDS — Projects
  // ══════════════════════════════════════════════════════════════

  document.getElementById('add-project-btn').addEventListener('click', () => {
    state.projects.push({
      name: '', description: '', techUsed: [], liveUrl: '', repoUrl: '',
    });
    renderProjectsList();
    scheduleSave();
  });

  function renderProjectsList() {
    const container = document.getElementById('projects-list');
    container.innerHTML = '';

    state.projects.forEach((proj, index) => {
      const entry = createDynamicEntry(
        `Project ${index + 1}`,
        index,
        'projects',
        [
          { id: `proj-name-${index}`, label: 'Project Name', key: 'name', type: 'text', value: proj.name },
          { id: `proj-desc-${index}`, label: 'Description', key: 'description', type: 'textarea', value: proj.description },
          { id: `proj-tech-${index}`, label: 'Tech Used (comma separated)', key: 'techUsed', type: 'text', value: (proj.techUsed || []).join(', ') },
          { id: `proj-live-${index}`, label: 'Live URL', key: 'liveUrl', type: 'text', value: proj.liveUrl },
          { id: `proj-repo-${index}`, label: 'Repo URL', key: 'repoUrl', type: 'text', value: proj.repoUrl },
        ]
      );
      container.appendChild(entry);
    });

    updatePreviewProjects();
  }

  // ══════════════════════════════════════════════════════════════
  //  FACTORY: createDynamicEntry
  //  I use a factory function to generate the HTML for each
  //  dynamic form entry block. It handles field rendering AND
  //  event binding so each array item is self-contained.
  // ══════════════════════════════════════════════════════════════

  function createDynamicEntry(title, index, arrayKey, fields) {
    const entry = document.createElement('div');
    entry.className = 'dynamic-entry';
    entry.setAttribute('data-index', index);

    let fieldsHtml = fields.map((f) => {
      const isTextarea = f.type === 'textarea';
      const inputEl = isTextarea
        ? `<textarea id="${f.id}" data-key="${f.key}" rows="3" placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>`
        : `<input type="${f.type}" id="${f.id}" data-key="${f.key}" value="${f.value || ''}" placeholder="${f.placeholder || ''}" />`;

      return `
        <div class="form-group">
          <label for="${f.id}">${f.label}</label>
          ${inputEl}
        </div>`;
    }).join('');

    entry.innerHTML = `
      <div class="dynamic-entry-header">
        <span class="dynamic-entry-title">${title}</span>
        <button class="remove-entry-btn" aria-label="Remove ${title}">✕ Remove</button>
      </div>
      <div class="form-row">${fieldsHtml}</div>`;

    // I bind the remove button inline here
    entry.querySelector('.remove-entry-btn').addEventListener('click', () => {
      state[arrayKey].splice(index, 1);
      if (arrayKey === 'experience') renderExperienceList();
      if (arrayKey === 'education') renderEducationList();
      if (arrayKey === 'projects') renderProjectsList();
      scheduleSave();
    });

    // I bind input events to update state and trigger preview refresh
    entry.addEventListener('input', (e) => {
      const el = e.target;
      const key = el.dataset.key;
      if (!key) return;

      // I handle the comma-separated techUsed field specially
      if (key === 'techUsed') {
        state[arrayKey][index][key] = el.value.split(',').map((t) => t.trim()).filter(Boolean);
      } else {
        state[arrayKey][index][key] = el.value;
      }

      if (arrayKey === 'experience') updatePreviewExperience();
      if (arrayKey === 'education') updatePreviewEducation();
      if (arrayKey === 'projects') updatePreviewProjects();
      scheduleSave();
    });

    return entry;
  }

  // ══════════════════════════════════════════════════════════════
  //  SKILLS PILLS MANAGEMENT & AUTOCOMPLETE
  // ══════════════════════════════════════════════════════════════

  const skillInput = document.getElementById('skill-input');
  const addSkillBtn = document.getElementById('add-skill-btn');
  const autocompleteList = document.getElementById('autocomplete-list');

  const skillsSuggestionsList = [
    "HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", "React", "Next.js", "Vue.js", "Angular",
    "Node.js", "Express.js", "Python", "Django", "Flask", "Java", "Spring Boot", "C++", "C#",
    "PHP", "Laravel", "Ruby on Rails", "Flutter", "Dart", "React Native", "Swift", "Kotlin",
    "Android Development", "iOS Development", "MongoDB", "PostgreSQL", "MySQL", "Firebase",
    "AWS", "Google Cloud", "Docker", "Kubernetes", "Git", "UI/UX Design", "Figma", "Agile/Scrum", "SEO"
  ];

  let currentFocus = -1;

  skillInput.addEventListener('input', function () {
    let val = this.value;
    closeAllLists();
    if (!val) return false;
    currentFocus = -1;

    autocompleteList.style.display = 'block';

    skillsSuggestionsList.forEach(skill => {
      if (skill.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
        const item = document.createElement('div');
        item.innerHTML = `<strong>${skill.substr(0, val.length)}</strong>${skill.substr(val.length)}`;
        item.innerHTML += `<input type='hidden' value='${skill}'>`;
        item.addEventListener('click', function () {
          skillInput.value = this.getElementsByTagName('input')[0].value;
          closeAllLists();
          addSkill();
        });
        autocompleteList.appendChild(item);
      }
    });
  });

  skillInput.addEventListener('keydown', function (e) {
    let x = autocompleteList.getElementsByTagName('div');
    if (e.key === 'ArrowDown') {
      currentFocus++;
      addActive(x);
    } else if (e.key === 'ArrowUp') {
      currentFocus--;
      addActive(x);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      } else {
        addSkill();
      }
    }
  });

  function addActive(x) {
    if (!x || x.length === 0) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add('autocomplete-active');
    x[currentFocus].scrollIntoView({ block: 'nearest' });
  }

  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active');
    }
  }

  function closeAllLists(elmnt) {
    if (elmnt !== skillInput) {
      autocompleteList.innerHTML = '';
      autocompleteList.style.display = 'none';
    }
  }

  document.addEventListener('click', function (e) {
    closeAllLists(e.target);
  });

  function addSkill() {
    const skill = skillInput.value.trim();
    if (!skill || state.techStack.includes(skill)) {
      skillInput.value = '';
      return;
    }
    state.techStack.push(skill);
    skillInput.value = '';
    closeAllLists();
    renderSkillsPills();
    updatePreviewSkills();
    scheduleSave();
  }

  addSkillBtn.addEventListener('click', addSkill);

  function renderSkillsPills() {
    const container = document.getElementById('skills-pills-container');
    container.innerHTML = '';

    state.techStack.forEach((skill, i) => {
      const pill = document.createElement('div');
      pill.className = 'skill-pill';
      pill.innerHTML = `
        <span>${skill}</span>
        <button aria-label="Remove ${skill}" data-index="${i}">✕</button>`;

      pill.querySelector('button').addEventListener('click', () => {
        state.techStack.splice(i, 1);
        renderSkillsPills();
        updatePreviewSkills();
        scheduleSave();
      });

      container.appendChild(pill);
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  PREVIEW UPDATERS
  //  I split preview updates by section so I only re-render what
  //  changed — this keeps the live preview feeling instant.
  // ══════════════════════════════════════════════════════════════

  function populateFormFields() {
    // I query all inputs with a data-field attribute and set their value
    document.querySelectorAll('[data-field]').forEach((el) => {
      const field = el.dataset.field;
      let value;

      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = state[parent]?.[child] || '';
      } else {
        value = state[field] || '';
      }

      if (el.tagName === 'TEXTAREA') el.value = value;
      else el.value = value;
    });
  }

  function renderFullPreview() {
    // I update each section of the preview on initial load
    updatePreviewField('fullName', state.fullName);
    updatePreviewField('jobTitle', state.jobTitle);
    updatePreviewField('email', state.email);
    updatePreviewField('phone', state.phone);
    updatePreviewField('location', state.location);
    updatePreviewField('summary', state.summary);
    updatePreviewField('avatarUrl', state.avatarUrl);
    updatePreviewField('social.github', state.social?.github);
    updatePreviewField('social.linkedin', state.social?.linkedin);
    updatePreviewField('social.twitter', state.social?.twitter);
    updatePreviewField('social.website', state.social?.website);
    updatePreviewExperience();
    updatePreviewEducation();
    updatePreviewProjects();
    updatePreviewSkills();

    if (state.template) {
      applyTemplate(state.template);
    }
  }

  function updatePreviewField(field, value) {
    switch (field) {
      case 'fullName':
        setText('prev-fullname', value || 'Kabeer Soomro');
        // Update initials
        const initials = (value || 'Kabeer Soomro').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
        setText('prev-avatar-initials', initials);
        break;
      case 'jobTitle':
        setText('prev-jobtitle', value || 'Full Stack Web Developer, Flutter App Developer');
        break;
      case 'email':
        setText('prev-email', value);
        break;
      case 'phone':
        setText('prev-phone', value);
        break;
      case 'location':
        setText('prev-location', value);
        break;
      case 'summary':
        setText('prev-summary', value);
        toggleSection('prev-summary-section', !!value);
        break;
      case 'avatarUrl':
        updateAvatar(value);
        break;
      default:
        // Social links — I rebuild the social row when any social field changes
        if (field.startsWith('social.')) updatePreviewSocial();
    }
  }

  function updateAvatar(url) {
    const img = document.getElementById('prev-avatar');
    const initials = document.getElementById('prev-avatar-initials');

    if (url) {
      img.src = url;
      img.hidden = false;
      initials.style.display = 'none';
    } else {
      img.hidden = true;
      initials.style.display = 'flex';
    }
  }

  function updatePreviewSocial() {
    const row = document.getElementById('prev-social-row');
    const links = [];

    const social = state.social || {};
    if (social.github) links.push(`<a href="${social.github}"   class="preview-social-link" target="_blank">GitHub</a>`);
    if (social.linkedin) links.push(`<a href="${social.linkedin}" class="preview-social-link" target="_blank">LinkedIn</a>`);
    if (social.twitter) links.push(`<a href="${social.twitter}"  class="preview-social-link" target="_blank">Twitter</a>`);
    if (social.website) links.push(`<a href="${social.website}"  class="preview-social-link" target="_blank">Portfolio</a>`);

    row.innerHTML = links.join('<span class="sep" aria-hidden="true">·</span>');
  }

  function updatePreviewExperience() {
    const container = document.getElementById('prev-experience-list');
    container.innerHTML = '';

    state.experience.forEach((exp) => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = `
        <div class="preview-item-header">
          <div>
            <div class="preview-item-title">${exp.jobTitle || '—'}</div>
            <div class="preview-item-subtitle">${exp.company || ''}${exp.location ? ` · ${exp.location}` : ''}</div>
          </div>
          <div class="preview-item-date">${formatDate(exp.startDate) || ''}${exp.endDate ? ` – ${formatDate(exp.endDate)}` : ''}</div>
        </div>
        ${exp.description ? `<p class="preview-item-desc">${exp.description}</p>` : ''}`;
      container.appendChild(item);
    });

    toggleSection('prev-experience-section', state.experience.length > 0);
  }

  function updatePreviewEducation() {
    const container = document.getElementById('prev-education-list');
    container.innerHTML = '';

    state.education.forEach((edu) => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = `
        <div class="preview-item-header">
          <div>
            <div class="preview-item-title">${edu.degree || '—'}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
            <div class="preview-item-subtitle">${edu.institution || ''}${edu.grade ? ` · GPA: ${edu.grade}` : ''}</div>
          </div>
          <div class="preview-item-date">${formatDate(edu.startDate) || ''}${edu.endDate ? ` – ${formatDate(edu.endDate)}` : ''}</div>
        </div>`;
      container.appendChild(item);
    });

    toggleSection('prev-education-section', state.education.length > 0);
  }

  function updatePreviewProjects() {
    const container = document.getElementById('prev-projects-list');
    container.innerHTML = '';

    state.projects.forEach((proj) => {
      const techHtml = (proj.techUsed || [])
        .map((t) => `<span class="preview-tech-pill">${t}</span>`)
        .join('');

      const linksHtml = `
        <div class="preview-project-links">
          ${proj.liveUrl ? `<a href="${proj.liveUrl}" target="_blank">Live Demo ↗</a>` : ''}
          ${proj.repoUrl ? `<a href="${proj.repoUrl}" target="_blank">Source Code ↗</a>` : ''}
        </div>`;

      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = `
        <div class="preview-item-title">${proj.name || '—'}</div>
        ${proj.description ? `<p class="preview-item-desc">${proj.description}</p>` : ''}
        <div class="preview-tech-pills" style="margin-top:8px">${techHtml}</div>
        ${(proj.liveUrl || proj.repoUrl) ? linksHtml : ''}`;
      container.appendChild(item);
    });

    toggleSection('prev-projects-section', state.projects.length > 0);
  }

  function updatePreviewSkills() {
    const container = document.getElementById('prev-skills-list');
    container.innerHTML = state.techStack
      .map((t) => `<span class="preview-tech-pill">${t}</span>`)
      .join('');
    toggleSection('prev-skills-section', state.techStack.length > 0);
  }

  // ── Utility Helpers ───────────────────────────────────────────
  function formatDate(yyyyMm) {
    if (!yyyyMm || !yyyyMm.includes('-')) return yyyyMm;
    const [year, month] = yyyyMm.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
  }

  function toggleSection(id, visible) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('empty', !visible);
  }

  // ══════════════════════════════════════════════════════════════
  //  DEBOUNCED AUTO-SAVE
  //  I use debounce here so the server doesn't get overloaded
  //  with a PATCH request on every single keystroke. I wait 1200ms
  //  after the user stops typing before sending the save request.
  // ══════════════════════════════════════════════════════════════

  let saveTimer = null;

  function scheduleSave() {
    // I show the "saving..." indicator immediately on any change
    setSaveStatus('saving', '⏳ Saving...');
    clearTimeout(saveTimer);

    saveTimer = setTimeout(async () => {
      await savePortfolio();
    }, 1200);
  }

  async function savePortfolio() {
    try {
      const res = await apiFetch('/portfolio', {
        method: 'PATCH',
        body: JSON.stringify(state),
      });

      if (res?.success) {
        setSaveStatus('saved', '✅ All changes saved');
      } else {
        setSaveStatus('error', '❌ Save failed');
      }
    } catch (err) {
      setSaveStatus('error', '❌ Network error');
    }
  }

  function setSaveStatus(status, text) {
    saveDot.className = 'save-dot';
    if (status === 'saving') saveDot.classList.add('saving');
    if (status === 'error') saveDot.classList.add('error');
    saveText.textContent = text;
  }

  // ══════════════════════════════════════════════════════════════
  //  THEME COLOR PICKER
  // ══════════════════════════════════════════════════════════════

  const themeColorBtn = document.getElementById('theme-color-btn');
  const themeModal = document.getElementById('theme-modal');
  const applyThemeBtn = document.getElementById('apply-theme-btn');
  const customColor = document.getElementById('custom-color');

  if (themeColorBtn) {
    themeColorBtn.addEventListener('click', () => {
      themeModal.hidden = false;
    });

    themeModal.addEventListener('click', (e) => {
      if (e.target === themeModal) themeModal.hidden = true;
    });

    const colorSwatches = document.getElementById('color-swatches');
    if (colorSwatches) {
      colorSwatches.addEventListener('click', (e) => {
        const swatch = e.target.closest('.swatch');
        if (!swatch) return;

        document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
        swatch.classList.add('active');
        customColor.value = swatch.dataset.color;
        // I preview the color in real-time when a swatch is clicked
        applyThemeColor(swatch.dataset.color);
      });
    }

    if (applyThemeBtn) {
      applyThemeBtn.addEventListener('click', () => {
        state.themeColor = customColor.value;
        applyThemeColor(state.themeColor);
        themeModal.hidden = true;
        scheduleSave();
      });
    }
  }

  function applyThemeColor(color) {
    document.documentElement.style.setProperty('--color-accent', color);
    // I also update accent-light and accent-glow derived values
    document.documentElement.style.setProperty('--color-accent-light', `${color}33`);
    document.documentElement.style.setProperty('--color-accent-glow', `${color}66`);
  }

  // ── Handle Tab Navigation from URL ──
  const tabParam = urlParams.get('tab');
  if (tabParam) {
    const targetTab = document.querySelector(`.editor-tab[data-section="${tabParam}"]`);
    if (targetTab) {
      targetTab.click();
      const editorWrapper = document.querySelector('.builder-editor');
      if (editorWrapper) {
        editorWrapper.scrollTop = 0;
        window.scrollTo(0, 0);
      }
    }
  }

  // I expose the state and savePortfolio so ocr.js can call them
  window.builderState = state;
  window.builderSave = scheduleSave;
  window.renderExpList = renderExperienceList;
  window.renderEduList = renderEducationList;
  window.renderFullPreview = renderFullPreview;

}); // end DOMContentLoaded
