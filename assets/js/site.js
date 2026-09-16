(function () {
  'use strict';
  var ADMIN_API_BASE = window.APEX_ADMIN_API_BASE = 'https://apex-bionet-admin.rajindra04.workers.dev/;
  var data = null;
  var page = document.documentElement.getAttribute('data-page') || '';
  var TOP_KEYS = ['site', 'home', 'focus', 'contact'];
  var SESSION_KEY = 'apexAdminToken';
  var PENDING_KEY = 'apexPendingData';
  var PENDING_IMAGES_KEY = 'apexPendingImages';
  var PENDING_IMAGES = loadPendingImages();
  window.__editMode = false;
  var EDIT_MODAL_OPEN = false;

  function get(object, path) { return path.split('.').reduce(function (value, key) { return value == null ? undefined : value[key]; }, object); }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function apiUrl(path) { return ADMIN_API_BASE.replace(/\/$/, '') + path; }

  function initNav() {
    var toggle = document.getElementById('navToggle'), links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () { var open = links.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    links.querySelectorAll('a').forEach(function (anchor) { anchor.addEventListener('click', function () { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }); });
    links.querySelectorAll('[data-page]').forEach(function (anchor) { if (anchor.getAttribute('data-page') === page) { anchor.classList.add('is-active'); anchor.setAttribute('aria-current', 'page'); } });
  }

  function displayValue(value) { if (value == null) return ''; if (typeof value === 'string' || typeof value === 'number') return String(value); if (Array.isArray(value)) return value.join(', '); if (typeof value === 'object') return value.label || value.name || value.title || value.value || ''; return String(value); }
  function bind(root, object) {
    root.querySelectorAll('[data-bind]').forEach(function (element) { var path = element.getAttribute('data-bind'), value = path === '.' ? object : get(object, path); if (value == null) return; if (element.tagName === 'IMG') element.src = displayValue(value); else if (!(path === '.' && typeof value === 'object')) element.textContent = displayValue(value); });
    root.querySelectorAll('[data-class]').forEach(function (element) { element.className = element.getAttribute('data-class').replace(/\{([^}]+)\}/g, function (_, key) { return object[key] || ''; }); });
    root.querySelectorAll('[data-href]').forEach(function (element) { var key = element.getAttribute('data-href'), value = key === 'detailUrl' ? object.detailUrl : get(object, key); if (value) element.href = value; });
  }

  function renderRepeats() {
    document.querySelectorAll('[data-repeat]').forEach(function (container) {
      var repeat = container.getAttribute('data-repeat');
      var values = get(data, repeat) || [], template = container.firstElementChild;
      if (!template) return;
      container.innerHTML = '';
      values.forEach(function (item, i) {
        var node = template.cloneNode(true);
        if (repeat === 'services') item.detailUrl = 'service-' + item.id + '.html';
        if (repeat === 'projects') item.detailUrl = 'project-' + item.id + '.html';
        bind(node, item);
        node.dataset.fullpath = repeat + '.' + i;
        node.querySelectorAll('[data-repeat]').forEach(function (nested) {
          var nestedPath = nested.getAttribute('data-repeat');
          var nestedValues = get(item, nestedPath) || [], nestedTemplate = nested.firstElementChild;
          nested.innerHTML = '';
          nestedValues.forEach(function (value) { var child = nestedTemplate.cloneNode(true); if (child.matches('[data-bind]')) child.textContent = displayValue(value); child.querySelectorAll('[data-bind]').forEach(function (element) { element.textContent = displayValue(value); }); nested.appendChild(child); });
          nested.dataset.fullpath = repeat + '.' + i + '.' + nestedPath;
        });
        container.appendChild(node);
      });
    });
  }

  function renderDetail() {
    var target = document.getElementById('detail-content');
    if (!target || !data) return;
    var match = window.location.pathname.match(/(service|project)-([^/]+)\.html$/);
    if (!match) return;
    var type = match[1], list = (type === 'service' ? data.services : data.projects), item = list.find(function (entry) { return entry.id === match[2]; });
    if (!item) { target.innerHTML = '<h1>Content not found</h1>'; return; }
    var idx = list.indexOf(item);
    var basePath = (type === 'service' ? 'services.' : 'projects.') + idx;
    var back = document.querySelector('[data-back-link]'); if (back) back.href = type === 'service' ? 'services.html' : 'projects.html';
    if (type === 'service') {
      target.innerHTML =
        '<div class="detail-hero">' +
          '<div>' +
            '<span class="eyebrow"><span class="sq"></span>' + esc(item.number) + ' — Service</span>' +
            controls([ep(basePath + '.number', 'Edit number'), ep(basePath + '.title', 'Edit title')]) +
            '<h1>' + esc(item.title) + '</h1>' +
            '<p class="detail-hero lead">' + esc(item.short) + '</p>' +
            controls([ep(basePath + '.short', 'Edit summary', true)]) +
            '<div class="detail-meta"><h3>Capabilities</h3><ul class="taglist">' + (item.tags || []).map(function (tag) { return '<li>' + esc(displayValue(tag)) + '</li>'; }).join('') + '</ul>' +
              controls([elp(basePath + '.tags', 'Edit tags (comma separated)', 'csv')]) +
            '</div>' +
          '</div>' +
          '<figure class="detail-image" style="position:relative;">' +
            '<img src="' + esc(item.image) + '" alt="">' +
            imgBtn(basePath + '.image') +
            '<figcaption>' + esc(item.figureCaption || '') + '</figcaption>' +
          '</figure>' +
        '</div>' +
        controls([ep(basePath + '.figureCaption', 'Edit image caption')]) +
        '<div class="detail-copy"><p>' + esc(item.description) + '</p></div>' +
        controls([ep(basePath + '.description', 'Edit description', true)]) +
        (item.stats && item.stats.length ? '<div class="assets"><div class="assets__head"><h4>Reference material on hand</h4></div><div class="stat-grid">' + item.stats.map(function (stat) { return '<div class="stat"><b>' + esc(stat.value) + '</b><span>' + esc(stat.label) + '</span></div>'; }).join('') + '</div></div>' : '<div class="edit-only block"></div>') +
        controls([elp(basePath + '.stats', 'Edit stats (one per line: value | label)', 'stats')]) +
        '<div class="detail-meta"><h3>Notes</h3>' + (item.notes || []).map(function (note) { return '<p>' + esc(note) + '</p>'; }).join('') + '</div>' +
        controls([elp(basePath + '.notes', 'Edit notes (one per line)', 'lines')]);
    } else {
      target.innerHTML =
        '<div class="detail-hero">' +
          '<div>' +
            '<span class="eyebrow"><span class="sq"></span>' + esc(item.tag) + '</span>' +
            controls([ep(basePath + '.tag', 'Edit category tag')]) +
            '<h1>' + esc(item.title) + '</h1>' +
            controls([ep(basePath + '.title', 'Edit title')]) +
            '<p class="detail-hero lead">' + esc(item.short) + '</p>' +
            controls([ep(basePath + '.short', 'Edit summary', true)]) +
          '</div>' +
          '<figure class="detail-image" style="position:relative;">' +
            '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '">' +
            imgBtn(basePath + '.image') +
          '</figure>' +
        '</div>' +
        '<div class="detail-copy">' + item.fullText.split(/\n\n/).map(function (paragraph) { return '<p>' + esc(paragraph) + '</p>'; }).join('') + '</div>' +
        controls([ep(basePath + '.fullText', 'Edit full text', true)]) +
        '<div class="detail-meta"><h3>Project vision</h3><p>' + esc(item.vision) + '</p></div>' +
        controls([ep(basePath + '.vision', 'Edit vision', true)]);
    }
  }

  function initForm() {
    var form = document.getElementById('enquiryForm'), status = document.getElementById('formStatus');
    if (!form || !status || !data) return;
    form.addEventListener('submit', function (event) { event.preventDefault(); var name = form.name.value.trim(), organization = form.org.value.trim(), email = form.email.value.trim(), topic = form.topic.value, message = form.message.value.trim(); if (!name || !email || !topic || !message) { status.textContent = 'Please complete the required fields before continuing.'; return; } if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = 'Please enter a valid email address.'; return; } var subject = 'Enquiry: ' + topic + (organization ? ' — ' + organization : ''), body = 'Name: ' + name + '\nOrganization: ' + (organization || '-') + '\nEmail: ' + email + '\nEnquiry type: ' + topic + '\n\n' + message; window.location.href = 'mailto:' + data.site.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); status.textContent = 'Opening your email app…'; });
  }

  /* ============================================================
     ADMIN: inline pencils + modal editors + bottom save bar
     (same pattern as the Manjushree Biotech template)
     ============================================================ */

  function loadPendingImages() { try { return JSON.parse(sessionStorage.getItem(PENDING_IMAGES_KEY) || '{}'); } catch (e) { return {}; } }
  function persistPendingImages() { sessionStorage.setItem(PENDING_IMAGES_KEY, JSON.stringify(PENDING_IMAGES)); }
  function persistPending() { try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(data)); } catch (e) { console.warn('Could not persist pending edits', e); } }
  function hasPendingChanges() { return sessionStorage.getItem(PENDING_KEY) != null || Object.keys(PENDING_IMAGES).length > 0; }

  function updatePath(object, path, value) {
    var keys = path.split('.'), last = keys.pop(), target = keys.reduce(function (current, key) { return current[key]; }, object); target[last] = value;
  }
  function removePath(object, path) {
    var keys = path.split('.'), last = keys.pop(), target = keys.reduce(function (current, key) { return current[key]; }, object);
    if (Array.isArray(target)) target.splice(Number(last), 1); else delete target[last];
  }

  function controls(buttonsHtml) { return '<div class="editable-controls edit-only">' + buttonsHtml.join('') + '</div>'; }
  // JSON.stringify uses double quotes, and these get embedded inside a
  // double-quoted onclick="..." HTML attribute — without escaping, the
  // first quote in the JSON output prematurely closes the attribute and
  // corrupts the markup, silently breaking the button. aj() escapes those
  // quotes as HTML entities so the browser decodes them back to real
  // quotes before the JS ever runs.
  function aj(value) { return JSON.stringify(value).replace(/"/g, '&quot;'); }
  function ep(path, label, multiline) { return '<button class="edit-pencil" onclick="window.__apexEdit(' + aj(path) + ',' + (multiline ? 'true' : 'false') + ')">' + esc(label) + '</button>'; }
  function elp(path, label, kind) { return '<button class="edit-pencil" onclick="window.__apexListEdit(' + aj(path) + ',' + aj(kind) + ')">' + esc(label) + '</button>'; }
  function imgBtn(path) { return '<button class="editable-img-btn edit-only" onclick="window.__apexImageEdit(' + aj(path) + ')">Photo</button>'; }

  window.__apexEdit = function (path, multiline) { promptTextEdit(path, multiline); };
  window.__apexListEdit = function (path, kind) { promptListEdit(path, kind); };
  window.__apexImageEdit = function (path) { promptImageEdit(path); };
  window.__apexAddItem = function (arrayPath, template) { addArrayItem(arrayPath, template); };
  window.__apexRemoveItem = function (arrayPath, idx) { removeArrayItem(arrayPath, idx); };

  function tryOpenModalLock() { if (EDIT_MODAL_OPEN) return false; EDIT_MODAL_OPEN = true; return true; }
  function releaseModalLock() { EDIT_MODAL_OPEN = false; }

  function promptTextEdit(path, multiline) {
    if (!data || !tryOpenModalLock()) return;
    var current = get(data, path);
    openTextEditorModal('Edit text', current == null ? '' : String(current), multiline, function (value) {
      updatePath(data, path, value);
      persistPending();
      rerender();
      markUnsaved();
    });
  }

  function promptListEdit(path, kind) {
    if (!data || !tryOpenModalLock()) return;
    var current = get(data, path) || [];
    var textValue;
    if (kind === 'csv') textValue = current.join(', ');
    else if (kind === 'stats') textValue = current.map(function (s) { return (s.value || '') + ' | ' + (s.label || ''); }).join('\n');
    else textValue = current.join('\n');
    var heading = kind === 'csv' ? 'Edit list (comma separated)' : (kind === 'stats' ? 'Edit list (one per line: value | label)' : 'Edit list (one item per line)');
    openTextEditorModal(heading, textValue, true, function (value) {
      var next;
      if (kind === 'csv') next = value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      else if (kind === 'stats') next = value.split('\n').map(function (line) { var parts = line.split('|'); var v = (parts[0] || '').trim(); var l = (parts.slice(1).join('|') || '').trim(); return v || l ? { value: v, label: l } : null; }).filter(Boolean);
      else next = value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      updatePath(data, path, next);
      persistPending();
      rerender();
      markUnsaved();
    });
  }

  function openTextEditorModal(heading, initialValue, multiline, onConfirm) {
    document.querySelectorAll('.text-edit-overlay').forEach(function (el) { el.remove(); });
    var uid = 'text-edit-' + Math.random().toString(36).slice(2);
    var overlay = document.createElement('div');
    overlay.className = 'admin-overlay text-edit-overlay open';
    overlay.innerHTML =
      '<div class="admin-box wide">' +
        '<h3>' + esc(heading) + '</h3>' +
        (multiline ? '<textarea id="' + uid + '" rows="8"></textarea>' : '<input id="' + uid + '" type="text">') +
        '<div class="admin-actions">' +
          '<button class="btn btn--admin-cancel text-edit-cancel">Cancel</button>' +
          '<button class="btn btn--admin-confirm text-edit-confirm">Apply</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    var input = overlay.querySelector('#' + uid);
    input.value = initialValue;
    input.focus();
    function cleanup() { overlay.remove(); releaseModalLock(); }
    overlay.onclick = function (e) { if (e.target === overlay) cleanup(); };
    overlay.querySelector('.text-edit-cancel').onclick = cleanup;
    overlay.querySelector('.text-edit-confirm').onclick = function () { onConfirm(input.value); cleanup(); };
  }

  function promptImageEdit(path) {
    if (!data) return;
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = function () {
      var file = fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var clean = file.name.replace(/[^a-z0-9._-]/gi, '-');
        var publicPath = 'assets/images/admin-' + Date.now() + '-' + clean;
        PENDING_IMAGES[publicPath] = reader.result;
        persistPendingImages();
        updatePath(data, path, publicPath);
        persistPending();
        rerender();
        markUnsaved();
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  }

  var ARRAY_TEMPLATES = {
    services: function () { return { id: 'new-service-' + Date.now(), number: String((data.services || []).length + 1).padStart(2, '0'), title: 'New service', short: '', description: '', tags: [], image: 'assets/images/service-assay.jpg', figureCaption: '', stats: [], notes: [] }; },
    projects: function () { return { id: 'new-project-' + Date.now(), tag: 'New project', title: 'New project', short: '', fullText: '', vision: '', image: 'assets/images/project-veterinary.jpg', detailUrl: '#' }; },
    'focus.pillars': function () { return { title: 'New pillar', description: 'Description goes here.', class: 'h' }; }
  };
  function addArrayItem(arrayPath, templateKey) {
    if (!data) return;
    var arr = get(data, arrayPath);
    if (!arr) { arr = []; updatePath(data, arrayPath, arr); }
    arr.push(ARRAY_TEMPLATES[templateKey || arrayPath]());
    persistPending();
    rerender();
    markUnsaved();
  }
  function removeArrayItem(arrayPath, idx) {
    if (!data) return;
    if (!confirm('Remove this item? This cannot be undone once saved.')) return;
    removePath(data, arrayPath + '.' + idx);
    persistPending();
    rerender();
    markUnsaved();
  }

  function markUnsaved() {
    var statusEl = document.getElementById('save-status');
    if (!statusEl) return;
    statusEl.textContent = 'Editing — changes are not yet saved.';
    statusEl.classList.remove('is-saved');
  }

  function discardChanges() {
    if (!confirm('Discard all unsaved changes and reload the live version?')) return;
    PENDING_IMAGES = {};
    sessionStorage.removeItem(PENDING_IMAGES_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    window.location.reload();
  }

  function getSessionToken() {
    var token = sessionStorage.getItem(SESSION_KEY);
    if (!token || token.indexOf('.') === -1) return null;
    var expires = parseInt(token.split('.')[0], 10);
    if (isNaN(expires) || Math.floor(Date.now() / 1000) >= expires) { sessionStorage.removeItem(SESSION_KEY); return null; }
    return token;
  }

  function verifyTokenWithServer(token) {
    return fetch(apiUrl('/verify'), { headers: { Authorization: 'Bearer ' + token } }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  function ensureAdminChrome() {
    document.querySelectorAll('.admin-open').forEach(function (btn) {
      if (btn.nextElementSibling && btn.nextElementSibling.classList.contains('admin-logout-btn')) return;
      var logout = document.createElement('button');
      logout.type = 'button';
      logout.className = 'btn btn--dark btn--sm admin-logout-btn hidden';
      logout.textContent = 'Log out';
      logout.style.marginLeft = '8px';
      btn.insertAdjacentElement('afterend', logout);
      logout.addEventListener('click', adminLogout);
      btn.addEventListener('click', function () {
        var token = getSessionToken();
        if (token) return;
        openAdminLogin();
      });
    });
    if (!document.getElementById('admin-login-modal')) {
      var modal = document.createElement('div');
      modal.className = 'admin-overlay';
      modal.id = 'admin-login-modal';
      modal.innerHTML =
        '<div class="admin-box">' +
          '<h3>Admin login</h3>' +
          '<p class="hint">Sign in to edit content in place.</p>' +
          '<label for="admin-username-input">Username</label>' +
          '<input id="admin-username-input" type="text" autocomplete="username">' +
          '<label for="admin-password-input">Password</label>' +
          '<input id="admin-password-input" type="password" autocomplete="current-password">' +
          '<div class="admin-error" id="admin-login-error"></div>' +
          '<div class="admin-actions">' +
            '<button class="btn btn--admin-cancel" id="admin-login-cancel">Cancel</button>' +
            '<button class="btn btn--admin-confirm" id="admin-login-submit">Log in</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeAdminLogin(); });
      modal.querySelector('#admin-login-cancel').addEventListener('click', closeAdminLogin);
      modal.querySelector('#admin-login-submit').addEventListener('click', submitAdminLogin);
      modal.querySelector('#admin-password-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') submitAdminLogin(); });
    }
    if (!document.getElementById('save-bar')) {
      var bar = document.createElement('div');
      bar.className = 'save-bar';
      bar.id = 'save-bar';
      bar.innerHTML =
        '<span class="save-status" id="save-status">No unsaved changes.</span>' +
        '<div class="save-bar-actions">' +
          '<button class="btn btn--discard" id="discard-btn">Discard changes</button>' +
          '<button class="btn btn--save" id="save-btn">Save changes (permanent)</button>' +
        '</div>';
      document.body.appendChild(bar);
      bar.querySelector('#discard-btn').addEventListener('click', discardChanges);
      bar.querySelector('#save-btn').addEventListener('click', saveAllChanges);
    }
  }

  function openAdminLogin() {
    ensureAdminChrome();
    var modal = document.getElementById('admin-login-modal');
    modal.classList.add('open');
    var u = document.getElementById('admin-username-input'), p = document.getElementById('admin-password-input'), err = document.getElementById('admin-login-error');
    if (u) u.value = ''; if (p) { p.value = ''; }
    if (err) err.classList.remove('show');
    if (u) u.focus();
  }
  function closeAdminLogin() { var m = document.getElementById('admin-login-modal'); if (m) m.classList.remove('open'); }

  function submitAdminLogin() {
    var u = document.getElementById('admin-username-input'), p = document.getElementById('admin-password-input'), err = document.getElementById('admin-login-error');
    var username = u ? u.value.trim() : '', password = p ? p.value : '';
    fetch(apiUrl('/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username, password: password }) })
      .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body }; }); })
      .then(function (result) {
        if (!result.ok) { if (err) { err.textContent = result.body.error || 'Incorrect username or password.'; err.classList.add('show'); } return; }
        sessionStorage.setItem(SESSION_KEY, result.body.token);
        closeAdminLogin();
        enterEditMode();
      })
      .catch(function () { if (err) { err.textContent = 'Could not reach admin server. Check the Worker URL and your connection.'; err.classList.add('show'); } });
  }

  function adminLogout() { sessionStorage.removeItem(SESSION_KEY); exitEditMode(); }

  function enterEditMode() {
    window.__editMode = true;
    document.body.classList.add('edit-mode');
    ensureAdminChrome();
    document.querySelectorAll('.admin-open').forEach(function (b) { b.classList.add('hidden'); });
    document.querySelectorAll('.admin-logout-btn').forEach(function (b) { b.classList.remove('hidden'); });
    document.getElementById('save-bar').classList.add('open');
    var statusEl = document.getElementById('save-status');
    if (statusEl) { if (hasPendingChanges()) { statusEl.textContent = 'Editing — changes are not yet saved.'; statusEl.classList.remove('is-saved'); } else { statusEl.textContent = 'No unsaved changes.'; } }
    rerender();
  }
  function exitEditMode() {
    window.__editMode = false;
    document.body.classList.remove('edit-mode');
    document.querySelectorAll('.admin-open').forEach(function (b) { b.classList.remove('hidden'); });
    document.querySelectorAll('.admin-logout-btn').forEach(function (b) { b.classList.add('hidden'); });
    var bar = document.getElementById('save-bar'); if (bar) bar.classList.remove('open');
  }

  function saveAllChanges() {
    var token = getSessionToken();
    if (!token) { alert('Your admin session expired. Please log in again.'); exitEditMode(); openAdminLogin(); return; }
    var saveBtn = document.getElementById('save-btn'), statusEl = document.getElementById('save-status');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }
    if (statusEl) statusEl.textContent = 'Committing changes to the live site...';
    var images = Object.keys(PENDING_IMAGES).map(function (path) { return { path: path, base64: PENDING_IMAGES[path] }; });
    fetch(apiUrl('/save'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ dataJson: data, images: images, commitMessage: 'Admin: update Apex Bionet content' })
    }).then(function (r) { return r.json().then(function (body) { return { ok: r.ok, status: r.status, body: body }; }); })
      .then(function (result) {
        if (result.status === 401) { alert('Your admin session expired. Please log in again.'); exitEditMode(); openAdminLogin(); return; }
        if (!result.ok) throw new Error(result.body.error || ('Save failed (' + result.status + ')'));
        alert('Changes successfully committed and pushed to GitHub! Give it a minute to update.');
        PENDING_IMAGES = {};
        sessionStorage.removeItem(PENDING_IMAGES_KEY);
        sessionStorage.removeItem(PENDING_KEY);
        if (statusEl) { statusEl.textContent = 'All changes saved permanently to GitHub.'; statusEl.classList.add('is-saved'); }
      })
      .catch(function (err) { alert('Failed to sync changes: ' + err.message); markUnsaved(); })
      .finally(function () { if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save changes (permanent)'; } });
  }

  function isAbsolutePath(path) { return TOP_KEYS.some(function (k) { return path === k || path.indexOf(k + '.') === 0; }); }
  function injectScalarPencils() {
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      var path = el.getAttribute('data-bind');
      if (!path || path === '.' || !isAbsolutePath(path)) return;
      if (el.tagName === 'IMG') {
        var parent = el.parentElement;
        // .hero__bg is z-index:0 and sits under .hero__scrim/.hero__inner (z-index 1/2) —
        // anchor the button to .hero itself instead, so it isn't hidden behind the scrim.
        if (parent.classList.contains('hero__bg') && parent.parentElement) parent = parent.parentElement;
        if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
        if (!parent.querySelector('.editable-img-btn')) parent.insertAdjacentHTML('beforeend', imgBtn(path));
      } else {
        if (el.nextElementSibling && el.nextElementSibling.classList && el.nextElementSibling.classList.contains('editable-controls')) return;
        var multiline = path.indexOf('Lede') !== -1 || path.indexOf('lede') !== -1 || path.indexOf('paragraphs') !== -1 || path === 'site.location';
        el.insertAdjacentHTML('afterend', controls([ep(path, 'Edit text', multiline)]));
      }
    });
  }

  function injectRepeatPencils() {
    document.querySelectorAll('[data-repeat="focus.pillars"]').forEach(function (container) {
      container.querySelectorAll(':scope > [data-fullpath]').forEach(function (node) {
        var base = node.dataset.fullpath;
        if (node.querySelector(':scope > .editable-controls')) return;
        var idx = base.split('.').pop();
        node.insertAdjacentHTML('beforeend', controls([ep(base + '.title', 'Edit title'), ep(base + '.description', 'Edit text', true), '<button class="edit-pencil danger" onclick="window.__apexRemoveItem(' + aj('focus.pillars') + ',' + idx + ')">Remove</button>']));
      });
      if (!container.nextElementSibling || !container.nextElementSibling.classList.contains('add-item-btn')) {
        container.insertAdjacentHTML('afterend', '<button class="add-item-btn edit-only" onclick="window.__apexAddItem(' + aj('focus.pillars') + ')">+ Add pillar</button>');
      }
    });

    document.querySelectorAll('[data-repeat="services"]').forEach(function (container) {
      container.querySelectorAll(':scope > [data-fullpath]').forEach(function (node) {
        var base = node.dataset.fullpath, idx = base.split('.').pop();
        if (node.querySelector(':scope > .editable-controls.svc')) return;
        var img = node.querySelector('img[data-bind="image"]');
        if (img) { var p = img.parentElement; if (getComputedStyle(p).position === 'static') p.style.position = 'relative'; if (!p.querySelector('.editable-img-btn')) p.insertAdjacentHTML('beforeend', imgBtn(base + '.image')); }
        var extraBtns = [
          ep(base + '.number', 'Edit number'), ep(base + '.title', 'Edit title'), ep(base + '.short', 'Edit summary', true),
          ep(base + '.description', 'Edit full description', true), ep(base + '.figureCaption', 'Edit caption'),
          elp(base + '.tags', 'Edit tags', 'csv'),
          '<button class="edit-pencil danger" onclick="window.__apexRemoveItem(' + aj('services') + ',' + idx + ')">Remove service</button>'
        ];
        node.insertAdjacentHTML('beforeend', '<div class="editable-controls svc edit-only">' + extraBtns.join('') + '</div>');
      });
      if (!container.nextElementSibling || !container.nextElementSibling.classList.contains('add-item-btn')) {
        container.insertAdjacentHTML('afterend', '<button class="add-item-btn edit-only" onclick="window.__apexAddItem(' + aj('services') + ')">+ Add service</button>');
      }
    });

    document.querySelectorAll('[data-repeat="projects"]').forEach(function (container) {
      container.querySelectorAll(':scope > [data-fullpath]').forEach(function (node) {
        var base = node.dataset.fullpath, idx = base.split('.').pop();
        if (node.querySelector(':scope > .editable-controls')) return;
        var img = node.querySelector('img[data-bind="image"]');
        if (img) { var p = img.parentElement; if (getComputedStyle(p).position === 'static') p.style.position = 'relative'; if (!p.querySelector('.editable-img-btn')) p.insertAdjacentHTML('beforeend', imgBtn(base + '.image')); }
        node.insertAdjacentHTML('beforeend', controls([
          ep(base + '.tag', 'Edit tag'), ep(base + '.title', 'Edit title'), ep(base + '.short', 'Edit summary', true),
          '<button class="edit-pencil danger" onclick="window.__apexRemoveItem(' + aj('projects') + ',' + idx + ')">Remove project</button>'
        ]));
      });
      if (!container.nextElementSibling || !container.nextElementSibling.classList.contains('add-item-btn')) {
        container.insertAdjacentHTML('afterend', '<button class="add-item-btn edit-only" onclick="window.__apexAddItem(' + aj('projects') + ')">+ Add project</button>');
      }
    });
  }

  function rerender() {
    if (!data) return;
    var wasEdit = window.__editMode;
    bind(document, data);
    renderRepeats();
    renderDetail();
    document.querySelectorAll('[data-href="emailHref"]').forEach(function (element) { element.href = 'mailto:' + data.site.email; });
    document.querySelectorAll('[data-href="phoneHref"]').forEach(function (element) { element.href = 'tel:' + data.site.phone.replace(/\s/g, ''); });
    document.querySelectorAll('[data-href="webHref"]').forEach(function (element) { element.href = 'https://' + data.site.web; });
    document.querySelectorAll('.editable-controls, .editable-img-btn, .add-item-btn').forEach(function (el) {
      if (el.closest('#detail-content')) return; // renderDetail() already rebuilt these fresh
      el.remove();
    });
    injectScalarPencils();
    injectRepeatPencils();
    if (wasEdit) enterEditModeChromeOnly();
  }
  function enterEditModeChromeOnly() {
    document.body.classList.add('edit-mode');
    document.querySelectorAll('.admin-open').forEach(function (b) { b.classList.add('hidden'); });
    document.querySelectorAll('.admin-logout-btn').forEach(function (b) { b.classList.remove('hidden'); });
    var bar = document.getElementById('save-bar'); if (bar) bar.classList.add('open');
  }

  function initAdminTrigger() {
    ensureAdminChrome();
    var token = getSessionToken();
    if (token) {
      verifyTokenWithServer(token).then(function (ok) { if (ok) enterEditMode(); else { sessionStorage.removeItem(SESSION_KEY); exitEditMode(); } });
    }
  }

  initNav();
  initAdminTrigger();
  var embedded = document.getElementById('detail-data');
  var promise = embedded ? Promise.resolve(JSON.parse(embedded.textContent)) : fetch('data.json').then(function (response) { if (!response.ok) throw Error('Content file returned ' + response.status); return response.json(); });
  promise.then(function (loaded) {
    var pending = sessionStorage.getItem(PENDING_KEY);
    data = pending ? JSON.parse(pending) : loaded;
    document.querySelectorAll('[data-bind]').forEach(function (element) { var value = get(data, element.getAttribute('data-bind')); if (value !== undefined && typeof value !== 'object') element.textContent = value; });
    renderRepeats();
    renderDetail();
    bind(document, data);
    document.querySelectorAll('[data-href="emailHref"]').forEach(function (element) { element.href = 'mailto:' + data.site.email; });
    document.querySelectorAll('[data-href="phoneHref"]').forEach(function (element) { element.href = 'tel:' + data.site.phone.replace(/\s/g, ''); });
    document.querySelectorAll('[data-href="webHref"]').forEach(function (element) { element.href = 'https://' + data.site.web; });
    initForm();
    if (window.__editMode) { injectScalarPencils(); injectRepeatPencils(); enterEditModeChromeOnly(); }
  }).catch(function (error) {
    console.error(error);
    var detail = document.getElementById('detail-content');
    if (detail) detail.innerHTML = '<h1>Unable to load this page content</h1><p>Please redeploy the complete site package, including data.json.</p>';
  });
}());
