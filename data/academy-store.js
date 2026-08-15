/* Shared browser data layer for the Academy builder/manager.
 * This is intentionally local-first: no secrets, passwords, or arbitrary code.
 * A future backend can replace these methods while keeping the same record shape.
 */
(function (global) {
  'use strict';
  const KEY = 'faa-academy-store-v2';
  const LEGACY = 'faa-academies-v1';

  function uid(prefix) {
    const raw = (global.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    return prefix + '-' + raw;
  }

  function clean(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function seedAcademy() {
    return {
      id: 'my-free-academy',
      name: 'My Free Academy',
      status: 'draft',
      branding: { primaryColor: '#635bff', language: 'Ελληνικά', logoUrl: null },
      courses: [],
      projects: [],
      release: { stage: 'draft', qaPassed: false, repository: null, commitSha: null, previewUrl: null },
      updatedAt: new Date().toISOString()
    };
  }

  function normalizeAcademy(a) {
    const x = a || {};
    return {
      id: clean(x.id) || uid('academy'),
      name: clean(x.name) || 'Untitled Academy',
      status: ['draft','qa','preview','published','archived'].includes(x.status) ? x.status : 'draft',
      branding: {
        primaryColor: clean(x.branding && x.branding.primaryColor) || '#635bff',
        language: clean(x.branding && x.branding.language) || 'Ελληνικά',
        logoUrl: x.branding && x.branding.logoUrl ? String(x.branding.logoUrl) : null
      },
      courses: Array.isArray(x.courses) ? x.courses : [],
      projects: Array.isArray(x.projects) ? x.projects : [],
      release: {
        stage: x.release && x.release.stage || 'draft',
        qaPassed: Boolean(x.release && x.release.qaPassed),
        repository: x.release && x.release.repository || null,
        commitSha: x.release && x.release.commitSha || null,
        previewUrl: x.release && x.release.previewUrl || null
      },
      updatedAt: x.updatedAt || new Date().toISOString()
    };
  }

  function read() {
    try {
      const parsed = JSON.parse(global.localStorage.getItem(KEY) || 'null');
      if (parsed && Array.isArray(parsed.academies)) return { version: '2.0', academies: parsed.academies.map(normalizeAcademy) };
      const legacy = JSON.parse(global.localStorage.getItem(LEGACY) || '[]');
      if (Array.isArray(legacy) && legacy.length) {
        return { version: '2.0', academies: legacy.map(function (item) {
          const a = seedAcademy();
          a.id = clean(item.id) || uid('academy');
          a.name = clean(item.name) || a.name;
          a.branding.language = clean(item.lang) || a.branding.language;
          return a;
        }) };
      }
    } catch (e) {}
    return { version: '2.0', academies: [] };
  }

  function write(db) {
    db.academies = db.academies.map(normalizeAcademy);
    global.localStorage.setItem(KEY, JSON.stringify(db));
    global.dispatchEvent(new CustomEvent('academy-store-change', { detail: db }));
    return db;
  }

  function list() { return read().academies; }
  function get(id) { return list().find(function (a) { return a.id === id; }) || null; }
  function save(academy) {
    const db = read();
    const normalized = normalizeAcademy(academy);
    normalized.updatedAt = new Date().toISOString();
    const i = db.academies.findIndex(function (a) { return a.id === normalized.id; });
    if (i >= 0) db.academies[i] = normalized; else db.academies.push(normalized);
    write(db);
    return normalized;
  }
  function create(name, language, color) {
    const a = seedAcademy();
    a.id = uid('academy');
    a.name = clean(name) || a.name;
    a.branding.language = clean(language) || a.branding.language;
    a.branding.primaryColor = clean(color) || a.branding.primaryColor;
    return save(a);
  }
  function remove(id) {
    const db = read();
    db.academies = db.academies.filter(function (a) { return a.id !== id; });
    write(db);
  }
  function clone(id) {
    const source = get(id);
    if (!source) return null;
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = uid('academy');
    copy.name = copy.name + ' — Copy';
    copy.status = 'draft';
    copy.release = { stage: 'draft', qaPassed: false, repository: null, commitSha: null, previewUrl: null };
    return save(copy);
  }
  function exportJSON(id) {
    const a = get(id);
    return a ? JSON.stringify({ version: '2.0', academy: a }, null, 2) : '';
  }

  global.AcademyStore = { list, get, save, create, remove, clone, exportJSON };
})(window);
