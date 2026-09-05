(function () {
  'use strict';
  var ADMIN_API_BASE = window.APEX_ADMIN_API_BASE= 'https://apex-bionet-admin.rajindra04.workers.dev/'
  var data = null;
  var page = document.documentElement.getAttribute('data-page') || '';

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

  function bind(root, object) {
    root.querySelectorAll('[data-bind]').forEach(function (element) { var path = element.getAttribute('data-bind'), value = path === '.' ? object : get(object, path); if (value == null) return; if (element.tagName === 'IMG') element.src = value; else element.textContent = value; });
    root.querySelectorAll('[data-class]').forEach(function (element) { element.className = element.getAttribute('data-class').replace(/\{([^}]+)\}/g, function (_, key) { return object[key] || ''; }); });
    root.querySelectorAll('[data-href]').forEach(function (element) { var key = element.getAttribute('data-href'), value = key === 'detailUrl' ? object.detailUrl : get(object, key); if (value) element.href = value; });
  }

  function renderRepeats() {
    document.querySelectorAll('[data-repeat]').forEach(function (container) {
      var values = get(data, container.getAttribute('data-repeat')) || [], template = container.firstElementChild;
      if (!template) return;
      container.innerHTML = '';
      values.forEach(function (item) {
        var node = template.cloneNode(true), repeat = container.getAttribute('data-repeat');
        if (repeat === 'services') item.detailUrl = 'service-' + item.id + '.html';
        if (repeat === 'projects') item.detailUrl = 'project-' + item.id + '.html';
        bind(node, item);
        node.querySelectorAll('[data-repeat]').forEach(function (nested) { var nestedValues = get(item, nested.getAttribute('data-repeat')) || [], nestedTemplate = nested.firstElementChild; nested.innerHTML = ''; nestedValues.forEach(function (value) { var child = nestedTemplate.cloneNode(true); child.querySelectorAll('[data-bind]').forEach(function (element) { element.textContent = value; }); nested.appendChild(child); }); });
        container.appendChild(node);
      });
    });
  }

  function renderDetail() {
    var target = document.getElementById('detail-content');
    if (!target || !data) return;
    var match = window.location.pathname.match(/(service|project)-([^/]+)\.html$/);
    if (!match) return;
    var type = match[1], item = (type === 'service' ? data.services : data.projects).find(function (entry) { return entry.id === match[2]; });
    if (!item) { target.innerHTML = '<h1>Content not found</h1>'; return; }
    var back = document.querySelector('[data-back-link]'); if (back) back.href = type === 'service' ? 'services.html' : 'projects.html';
    if (type === 'service') {
      target.innerHTML = '<div class="detail-hero"><div><span class="eyebrow"><span class="sq"></span>' + esc(item.number) + ' — Service</span><h1>' + esc(item.title) + '</h1><p class="detail-hero lead">' + esc(item.short) + '</p><div class="detail-meta"><h3>Capabilities</h3><ul class="taglist">' + (item.tags || []).map(function (tag) { return '<li>' + esc(tag) + '</li>'; }).join('') + '</ul></div></div><figure class="detail-image"><img src="' + esc(item.image) + '" alt=""><figcaption>' + esc(item.figureCaption || '') + '</figcaption></figure></div><div class="detail-copy"><p>' + esc(item.description) + '</p></div>' + (item.stats && item.stats.length ? '<div class="assets"><div class="assets__head"><h4>Reference material on hand</h4></div><div class="stat-grid">' + item.stats.map(function (stat) { return '<div class="stat"><b>' + esc(stat.value) + '</b><span>' + esc(stat.label) + '</span></div>'; }).join('') + '</div></div>' : '') + '<div class="detail-meta"><h3>Notes</h3>' + (item.notes || []).map(function (note) { return '<p>' + esc(note) + '</p>'; }).join('') + '</div>';
    } else {
      target.innerHTML = '<div class="detail-hero"><div><span class="eyebrow"><span class="sq"></span>' + esc(item.tag) + '</span><h1>' + esc(item.title) + '</h1><p class="detail-hero lead">' + esc(item.short) + '</p></div><figure class="detail-image"><img src="' + esc(item.image) + '" alt="' + esc(item.title) + '"></figure></div><div class="detail-copy">' + item.fullText.split(/\n\n/).map(function (paragraph) { return '<p>' + esc(paragraph) + '</p>'; }).join('') + '</div><div class="detail-meta"><h3>Project vision</h3><p>' + esc(item.vision) + '</p></div>';
    }
  }

  function initForm() {
    var form = document.getElementById('enquiryForm'), status = document.getElementById('formStatus');
    if (!form || !status || !data) return;
    form.addEventListener('submit', function (event) { event.preventDefault(); var name = form.name.value.trim(), organization = form.org.value.trim(), email = form.email.value.trim(), topic = form.topic.value, message = form.message.value.trim(); if (!name || !email || !topic || !message) { status.textContent = 'Please complete the required fields before continuing.'; return; } if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = 'Please enter a valid email address.'; return; } var subject = 'Enquiry: ' + topic + (organization ? ' — ' + organization : ''), body = 'Name: ' + name + '\nOrganization: ' + (organization || '-') + '\nEmail: ' + email + '\nEnquiry type: ' + topic + '\n\n' + message; window.location.href = 'mailto:' + data.site.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); status.textContent = 'Opening your email app…'; });
  }

  function downloadJson(next) { var blob = new Blob([JSON.stringify(next, null, 2) + '\n'], { type: 'application/json' }), url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = 'data.json'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); }
  function closeAdmin() { var root = document.getElementById('admin-root'); if (root) root.innerHTML = ''; }

  function editorPanel(token) {
    var root = document.getElementById('admin-root');
    root.innerHTML = '<div class="admin-backdrop"></div><aside class="admin-panel"><button class="admin-close" aria-label="Close">×</button><div class="admin-session"><span class="admin-session-dot"></span>Admin signed in <button id="admin-logout" type="button">Log out</button></div><h2>Site editor</h2><p class="admin-help">Edit the structured content below. Save to GitHub commits it to the repository. Download data.json is available as a manual fallback.</p><label>Content JSON</label><textarea id="admin-json" rows="18"></textarea><label>Upload image</label><input id="admin-image" type="file" accept="image/*"><div class="admin-actions"><button class="btn btn--dark" id="admin-save">Save to GitHub</button><button class="btn btn--dark" id="admin-download">Download data.json</button></div><div class="admin-status" id="admin-status"></div></aside>';
    var panel = root.querySelector('.admin-panel'), jsonField = panel.querySelector('#admin-json');
    jsonField.value = JSON.stringify(data, null, 2);
    root.querySelector('.admin-backdrop').onclick = closeAdmin; root.querySelector('.admin-close').onclick = closeAdmin;
    panel.querySelector('#admin-logout').onclick = function () { sessionStorage.removeItem('apexAdminToken'); closeAdmin(); };
    panel.querySelector('#admin-download').onclick = function () { try { downloadJson(JSON.parse(jsonField.value)); panel.querySelector('#admin-status').textContent = 'Downloaded data.json. Upload it to the repository root to publish changes.'; } catch (error) { panel.querySelector('#admin-status').textContent = 'Invalid JSON: ' + error.message; } };
    panel.querySelector('#admin-save').onclick = function () {
      var status = panel.querySelector('#admin-status'), next;
      if (!token) { status.textContent = 'Your login session has expired. Please log in again.'; return; }
      try { next = JSON.parse(jsonField.value); } catch (error) { status.textContent = 'Invalid JSON: ' + error.message; return; }
      var file = panel.querySelector('#admin-image').files[0];
      var send = function (images) { fetch(apiUrl('/save'), { method: 'POST', headers: {'Content-Type':'application/json', 'Authorization':'Bearer ' + token}, body: JSON.stringify({ dataJson: next, images: images, commitMessage: 'Admin: update Apex Bionet content' }) }).then(function (response) { return response.json().then(function (body) { return { ok: response.ok, body: body }; }); }).then(function (result) { if (!result.ok) throw Error(result.body.error || 'Save failed'); data = next; status.textContent = 'Saved to GitHub successfully.'; }).catch(function (error) { status.textContent = error.message; }); };
      if (!file) { send([]); return; }
      var reader = new FileReader(); reader.onload = function () { send([{ path: 'assets/images/admin-' + Date.now() + '-' + file.name.replace(/[^a-z0-9._-]/gi, '-'), base64: reader.result }]); }; reader.readAsDataURL(file);
    };
  }

  function loginPanel() {
    var root = document.getElementById('admin-root');
    root.innerHTML = '<div class="admin-backdrop"></div><aside class="admin-panel admin-login-panel"><button class="admin-close" aria-label="Close">×</button><span class="eyebrow"><span class="sq"></span>Restricted area</span><h2>Admin login</h2><p class="admin-help">Sign in to edit site content, upload images, and publish changes to GitHub.</p><form id="admin-login-form"><label for="admin-username">Username</label><input id="admin-username" name="username" autocomplete="username" placeholder="Admin username" required><label for="admin-password">Password</label><input id="admin-password" name="password" type="password" autocomplete="current-password" placeholder="Admin password" required><button class="btn btn--primary admin-login-submit" type="submit">Sign in</button></form><p class="admin-help admin-login-fallback">If GitHub saving is not configured yet, you can still use the editor to download an updated data.json file.</p><button class="btn btn--dark" id="admin-offline">Continue with offline editor</button><div class="admin-status" id="admin-status"></div></aside>';
    var panel = root.querySelector('.admin-panel'), form = panel.querySelector('#admin-login-form'), status = panel.querySelector('#admin-status');
    root.querySelector('.admin-backdrop').onclick = closeAdmin; root.querySelector('.admin-close').onclick = closeAdmin;
    panel.querySelector('#admin-offline').onclick = function () { editorPanel(''); };
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!ADMIN_API_BASE) { status.textContent = 'GitHub login is not connected yet. Deploy the Worker and set APEX_ADMIN_API_BASE, or choose offline editor below.'; return; }
      var submit = panel.querySelector('.admin-login-submit'); submit.disabled = true; submit.textContent = 'Signing in…'; status.textContent = '';
      fetch(apiUrl('/login'), { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: form.username.value.trim(), password: form.password.value }) }).then(function (response) { return response.json().then(function (body) { return { ok: response.ok, body: body }; }); }).then(function (result) { if (!result.ok) throw Error(result.body.error || 'Incorrect username or password.'); sessionStorage.setItem('apexAdminToken', result.body.token); editorPanel(result.body.token); }).catch(function (error) { submit.disabled = false; submit.textContent = 'Sign in'; status.textContent = error.message; });
    });
  }

  function initAdmin() { document.querySelectorAll('.admin-open').forEach(function (button) { button.addEventListener('click', function () { var token = sessionStorage.getItem('apexAdminToken'); if (token && ADMIN_API_BASE) editorPanel(token); else loginPanel(); }); }); }

  initNav(); initAdmin();
  var embedded = document.getElementById('detail-data');
  var promise = embedded ? Promise.resolve(JSON.parse(embedded.textContent)) : fetch('data.json').then(function (response) { if (!response.ok) throw Error('Content file returned ' + response.status); return response.json(); });
  promise.then(function (loaded) { data = loaded; document.querySelectorAll('[data-bind]').forEach(function (element) { var value = get(data, element.getAttribute('data-bind')); if (value !== undefined && typeof value !== 'object') element.textContent = value; }); renderRepeats(); renderDetail(); bind(document, data); document.querySelectorAll('[data-href="emailHref"]').forEach(function (element) { element.href = 'mailto:' + data.site.email; }); document.querySelectorAll('[data-href="phoneHref"]').forEach(function (element) { element.href = 'tel:' + data.site.phone.replace(/\s/g, ''); }); document.querySelectorAll('[data-href="webHref"]').forEach(function (element) { element.href = 'https://' + data.site.web; }); initForm(); }).catch(function (error) { console.error(error); var detail = document.getElementById('detail-content'); if (detail) detail.innerHTML = '<h1>Unable to load this page content</h1><p>Please redeploy the complete site package, including data.json.</p>'; });
}());
