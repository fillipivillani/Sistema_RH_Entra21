/** Utilitários compartilhados do frontend */
const RH = {
  /* ---------- texto / formatação ---------- */

  onlyDigits: (s) => (s ?? '').toString().replace(/\D+/g, ''),

  escapeHtml: (s) => (s ?? '').toString().replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),

  debounce(fn, ms = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  byText: (key) => (a, b) => (a[key] || '').toString().localeCompare((b[key] || '').toString(), 'pt-BR'),

  normalize: (s) => (s ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(),

  param: (name) => new URLSearchParams(location.search).get(name),

  formatDate(v) {
    if (!v) return '—';
    const d = new Date(String(v).length <= 10 ? `${v}T00:00:00` : v);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
  },

  formatDateTime(v) {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '—'
      : d.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  formatTime: (v) => (v ? String(v).slice(0, 5) : '—'),

  formatCurrency(v) {
    const n = typeof v === 'string' ? Number(v.replace(/[^\d.,-]/g, '').replace(',', '.')) : Number(v);
    return v != null && v !== '' && Number.isFinite(n)
      ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : '—';
  },

  formatCPF(v) {
    const d = RH.onlyDigits(v);
    return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : (v || '—');
  },

  formatPhone(v) {
    const d = RH.onlyDigits(v);
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return v || '—';
  },

  plural: (n, um, varios) => `${n} ${n === 1 ? um : varios}`,

  /* ---------- avatares / badges ---------- */

  initials(nome) {
    const p = (nome || '?').trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || '?';
  },

  colorFor(seed) {
    const palette = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#3b82f6', '#a855f7', '#14b8a6', '#ef4444'];
    let h = 0;
    for (const c of (seed || '').toString()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return palette[h % palette.length];
  },

  avatar(nome, foto, cls = '') {
    if (foto && /^(https?:|data:image)/.test(foto)) {
      return `<img src="${RH.escapeHtml(foto)}" class="avatar ${cls}" alt="" onerror="this.outerHTML=RH.avatar(${RH.escapeHtml(JSON.stringify(nome || ''))}, null, '${cls}')">`;
    }
    return `<span class="avatar ${cls}" style="background:${RH.colorFor(nome)}">${RH.escapeHtml(RH.initials(nome))}</span>`;
  },

  badge(label, tone = 'primary', dot = true) {
    return `<span class="badge-soft tone-${tone}${dot ? '' : ' no-dot'}">${RH.escapeHtml(label)}</span>`;
  },

  statusBadge: (ativo) => RH.badge(ativo === false ? 'Inativo' : 'Ativo', ativo === false ? 'danger' : 'success'),

  /* ---------- estados ---------- */

  stateHtml({ icon = 'bi-inbox', title, text = '', action = '', error = false }) {
    return `<div class="state ${error ? 'error' : ''} fade-in">
      <div class="state-icon"><i class="bi ${icon}"></i></div>
      <strong>${RH.escapeHtml(title)}</strong>
      ${text ? `<p>${RH.escapeHtml(text)}</p>` : ''}
      ${action}
    </div>`;
  },

  errorState(msg, retryId = 'btn-retry') {
    return RH.stateHtml({
      icon: 'bi-wifi-off',
      title: 'Não foi possível carregar os dados',
      text: msg,
      error: true,
      action: `<button class="btn btn-soft" id="${retryId}"><i class="bi bi-arrow-clockwise"></i> Tentar novamente</button>`,
    });
  },

  skeletonRows(cols, rows = 5) {
    return Array.from({ length: rows }, () =>
      `<tr>${Array.from({ length: cols }, () => '<td><span class="skeleton" style="height:14px;width:80%"></span></td>').join('')}</tr>`).join('');
  },

  skeletonCards(n = 6, col = 'col-md-6 col-xl-4') {
    return Array.from({ length: n }, () =>
      `<div class="${col}"><div class="entity-card p-4">
        <span class="skeleton mb-3" style="height:44px;width:44px;border-radius:12px"></span>
        <span class="skeleton mb-2" style="height:16px;width:60%"></span>
        <span class="skeleton" style="height:12px;width:90%"></span>
      </div></div>`).join('');
  },

  /* ---------- feedback ---------- */

  toast(type, msg) {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = `app-toast ${type}`;
    el.innerHTML = `<i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-octagon-fill'}"></i>
      <span>${RH.escapeHtml(msg)}</span><button type="button" class="btn-close" aria-label="Fechar"></button>`;
    const close = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 200); };
    el.querySelector('.btn-close').onclick = close;
    stack.appendChild(el);
    setTimeout(close, type === 'success' ? 3500 : 6000);
  },

  success: (msg) => RH.toast('success', msg),
  error: (msg) => RH.toast('error', msg),

  /** Modal de confirmação reutilizável. Retorna Promise<boolean>. */
  confirm({ title = 'Tem certeza?', message = '', confirmText = 'Excluir', onConfirm } = {}) {
    let el = document.getElementById('rh-confirm');
    if (!el) {
      el = document.createElement('div');
      el.className = 'modal fade';
      el.id = 'rh-confirm';
      el.tabIndex = -1;
      el.innerHTML = `<div class="modal-dialog modal-dialog-centered" style="max-width:420px"><div class="modal-content">
        <div class="modal-body p-4">
          <div class="confirm-icon"><i class="bi bi-trash3"></i></div>
          <h5 class="mb-2" data-title></h5>
          <p class="text-muted mb-0" data-message></p>
        </div>
        <div class="modal-footer border-0 pt-0 px-4 pb-4">
          <button type="button" class="btn btn-soft" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger" data-ok></button>
        </div></div></div>`;
      document.body.appendChild(el);
    }
    el.querySelector('[data-title]').textContent = title;
    el.querySelector('[data-message]').innerHTML = message;
    const ok = el.querySelector('[data-ok]');
    ok.textContent = confirmText;
    const modal = bootstrap.Modal.getOrCreateInstance(el);

    return new Promise((resolve) => {
      let confirmed = false;
      ok.onclick = async () => {
        if (onConfirm) {
          RH.busy(ok, true, 'Excluindo...');
          try { await onConfirm(); } catch (err) { RH.busy(ok, false); RH.error(err.message); return; }
          RH.busy(ok, false);
        }
        confirmed = true;
        modal.hide();
      };
      el.addEventListener('hidden.bs.modal', () => resolve(confirmed), { once: true });
      modal.show();
    });
  },

  busy(btn, on, text = 'Salvando...') {
    if (!btn) return;
    if (on) {
      btn.dataset.label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${text}`;
    } else {
      btn.disabled = false;
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  },

  formError(form, msg) {
    let el = form.querySelector('.form-error');
    if (!msg) { el?.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.className = 'form-error';
      (form.querySelector('.modal-body') || form).prepend(el);
    }
    el.innerHTML = `<i class="bi bi-exclamation-circle"></i><span>${RH.escapeHtml(msg)}</span>`;
  },

  resetForm(form) {
    form.reset();
    form.classList.remove('was-validated');
    form.querySelectorAll('.is-invalid').forEach((e) => e.classList.remove('is-invalid'));
    RH.formError(form, null);
  },

  /* ---------- selects / paginação ---------- */

  fillSelect(el, items, { value = 'id', label = 'nome', first = 'Selecione', selected } = {}) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    el.innerHTML = (first != null ? `<option value="">${RH.escapeHtml(first)}</option>` : '') +
      items.map((i) => {
        const v = typeof value === 'function' ? value(i) : i[value];
        const l = typeof label === 'function' ? label(i) : i[label];
        return `<option value="${RH.escapeHtml(v)}">${RH.escapeHtml(l)}</option>`;
      }).join('');
    if (selected != null) el.value = String(selected);
  },

  paginate(list, page, size) {
    const pages = Math.max(1, Math.ceil(list.length / size));
    const p = Math.min(Math.max(1, page), pages);
    return { page: p, pages, items: list.slice((p - 1) * size, p * size) };
  },

  renderPagination(nav, info, { page, pages, total, size, onPage }) {
    if (!total) { nav.innerHTML = ''; info.textContent = ''; return; }
    const start = (page - 1) * size + 1;
    info.textContent = `Mostrando ${start}–${Math.min(page * size, total)} de ${total}`;
    const item = (label, p, off, active) =>
      `<li class="page-item ${off ? 'disabled' : ''} ${active ? 'active' : ''}"><a href="#" class="page-link" data-page="${p}">${label}</a></li>`;
    nav.innerHTML = pages <= 1 ? '' : [
      item('<i class="bi bi-chevron-left"></i>', page - 1, page === 1),
      ...Array.from({ length: pages }, (_, i) => item(i + 1, i + 1, false, i + 1 === page)),
      item('<i class="bi bi-chevron-right"></i>', page + 1, page === pages),
    ].join('');
    nav.querySelectorAll('[data-page]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      const p = Number(a.dataset.page);
      if (p >= 1 && p <= pages && p !== page) onPage(p);
    }));
  },

  /* ---------- máscaras ---------- */

  mask(el, fn) {
    if (!el) return;
    el.addEventListener('input', () => { el.value = fn(el.value); el.classList.remove('is-invalid'); });
  },

  maskCPF: (v) => RH.onlyDigits(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4'),

  maskPhone(v) {
    v = RH.onlyDigits(v).slice(0, 11);
    if (v.length <= 2) return v;
    if (v.length <= 6) return v.replace(/(\d{2})(\d+)/, '($1) $2');
    if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  },

  maskCEP: (v) => RH.onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),

  isValidCPF(cpf) {
    cpf = RH.onlyDigits(cpf);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    const check = (t) => {
      let s = 0;
      for (let i = 0; i < t - 1; i++) s += +cpf[i] * (t - i);
      const d = 11 - (s % 11);
      return d > 9 ? 0 : d;
    };
    return check(10) === +cpf[9] && check(11) === +cpf[10];
  },
};
