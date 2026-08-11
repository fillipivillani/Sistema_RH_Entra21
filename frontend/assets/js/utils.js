/** Utilitários compartilhados do frontend */
const RH = {
  onlyDigits: (s) => (s || '').toString().replace(/\D+/g, ''),

  escapeHtml: (s) => (s ?? '').toString().replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),

  debounce(fn, ms = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  formatDate(v) {
    if (!v) return '—';
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
  },

  formatCurrency(v) {
    const n = Number(v);
    return Number.isFinite(n)
      ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
      : '—';
  },

  loadStorage(key, seed) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
    } catch (e) { console.warn(`Erro ao ler ${key}`, e); }
    if (seed) localStorage.setItem(key, JSON.stringify(seed));
    return seed ? seed.slice() : [];
  },

  saveStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.error(`Erro ao salvar ${key}`, e); }
  },

  showTab(tabEl) {
    if (!tabEl) return;
    window.bootstrap ? new bootstrap.Tab(tabEl).show() : tabEl.click();
  },

  fillSelect(id, items, first = 'Selecione') {
    const el = document.getElementById(id);
    if (!el) return;
    if (first) el.innerHTML = `<option value="">${first}</option>`;
    items.forEach((v) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v;
      el.appendChild(o);
    });
  },

  appendSelect(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    items.forEach((v) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v;
      el.appendChild(o);
    });
  },

  alert(tipo, msg, stackId = 'alert-stack') {
    const stack = document.getElementById(stackId);
    if (!stack) return;
    const el = document.createElement('div');
    el.className = `app-alert ${tipo}`;
    el.innerHTML = `<i class="bi bi-${tipo === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}"></i>
      <span>${RH.escapeHtml(msg)}</span>
      <button type="button" class="btn-close" aria-label="Fechar"></button>`;
    el.querySelector('.btn-close').onclick = () => el.remove();
    stack.appendChild(el);
    if (tipo === 'success') setTimeout(() => el.remove(), 4000);
  },

  renderPagination({ navId, infoId, page, pageSize, total, onPage }) {
    const nav = document.getElementById(navId);
    const info = document.getElementById(infoId);
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (!total) { nav.innerHTML = ''; info.textContent = ''; return pages; }

    const start = (page - 1) * pageSize + 1;
    info.textContent = `Mostrando ${start}–${Math.min(page * pageSize, total)} de ${total}`;

    const item = (label, p, off, active) =>
      `<li class="page-item ${off ? 'disabled' : ''} ${active ? 'active' : ''}">
        <a href="#" class="page-link" data-page="${p}">${label}</a></li>`;

    nav.innerHTML = [
      item('«', page - 1, page === 1),
      ...Array.from({ length: pages }, (_, i) => item(String(i + 1), i + 1, false, i + 1 === page)),
      item('»', page + 1, page === pages),
    ].join('');

    nav.querySelectorAll('[data-page]').forEach((a) => {
      a.onclick = (e) => {
        e.preventDefault();
        const p = Number(a.dataset.page);
        if (p >= 1 && p <= pages && p !== page) onPage(p);
      };
    });
    return pages;
  },

  STATUS: {
    ATIVO: { label: 'Ativo', className: 'status-ativo' },
    INATIVO: { label: 'Inativo', className: 'status-inativo' },
    AFASTADO: { label: 'Afastado', className: 'status-afastado' },
    DESLIGADO: { label: 'Desligado', className: 'status-desligado' },
  },

  statusBadge(status, map) {
    const key = (status || 'ATIVO').toString().toUpperCase();
    const m = map?.[key] || RH.STATUS[key] || RH.STATUS.INATIVO;
    return `<span class="status-badge ${m.className}">${m.label}</span>`;
  },
};
