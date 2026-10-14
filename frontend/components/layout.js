/** Shell da aplicação: sidebar, topbar, tema e status da API */
(function () {
  const MENU = [
    { section: 'Visão geral' },
    { href: 'inicio.html', icon: 'bi-grid-1x2', label: 'Início' },
    { section: 'Pessoas' },
    { href: 'funcionarios.html', icon: 'bi-people', label: 'Funcionários', match: ['funcionario-form.html', 'funcionario-detalhe.html'] },
    { href: 'movimentacoes.html', icon: 'bi-arrow-left-right', label: 'Movimentações' },
    { href: 'escalas.html', icon: 'bi-calendar-week', label: 'Escalas' },
    { href: 'beneficios.html', icon: 'bi-gift', label: 'Benefícios' },
    { href: 'recrutamento.html', icon: 'bi-person-plus', label: 'Recrutamento' },
    { section: 'Estrutura' },
    { href: 'departamentos.html', icon: 'bi-building', label: 'Departamentos' },
    { href: 'cargos.html', icon: 'bi-briefcase', label: 'Cargos' },
  ];

  const atual = location.pathname.split('/').pop() || 'inicio.html';
  const titulo = document.body.dataset.title || document.title.split(' · ')[0];
  const main = document.querySelector('main.app-content');

  const nav = MENU.map((m) => {
    if (m.section) return `<div class="sidebar-section">${m.section}</div>`;
    const active = m.href === atual || m.match?.includes(atual);
    return `<a href="${m.href}" class="sidebar-link ${active ? 'active' : ''}"${active ? ' aria-current="page"' : ''}>
      <i class="bi ${m.icon}"></i><span>${m.label}</span></a>`;
  }).join('');

  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  sidebar.innerHTML = `
    <a href="inicio.html" class="sidebar-brand"><span class="brand-mark">RH</span><span>Sistema RH</span></a>
    <nav class="sidebar-nav">${nav}</nav>
    <div class="sidebar-footer">
      <div class="api-status"><span class="api-dot" id="api-dot"></span><span id="api-label">Verificando API...</span></div>
    </div>`;

  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';

  const wrapper = document.createElement('div');
  wrapper.className = 'app-main';
  wrapper.innerHTML = `
    <header class="app-topbar">
      <button class="icon-btn sidebar-toggle" id="sidebar-toggle" aria-label="Abrir menu"><i class="bi bi-list"></i></button>
      <div class="topbar-crumbs">Sistema RH <i class="bi bi-chevron-right mx-1 small"></i> <strong>${titulo}</strong></div>
      <div class="topbar-actions">
        <button class="icon-btn" id="theme-toggle" aria-label="Alternar tema"><i class="bi"></i></button>
      </div>
    </header>`;

  document.body.prepend(sidebar, backdrop, wrapper);
  if (main) wrapper.appendChild(main);

  const toggleSidebar = (open) => document.body.classList.toggle('sidebar-open', open);
  document.getElementById('sidebar-toggle').onclick = () => toggleSidebar(true);
  backdrop.onclick = () => toggleSidebar(false);

  const themeBtn = document.getElementById('theme-toggle');
  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-bs-theme', t);
    themeBtn.querySelector('i').className = `bi ${t === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`;
    try { localStorage.setItem('rh-theme', t); } catch { /* sem storage */ }
  };
  applyTheme(document.documentElement.getAttribute('data-bs-theme') || 'light');
  themeBtn.onclick = () => applyTheme(document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');

  // Mensagem deixada por outra página antes de redirecionar
  try {
    const flash = sessionStorage.getItem('rh-flash');
    if (flash && typeof RH !== 'undefined') { sessionStorage.removeItem('rh-flash'); RH.success(flash); }
  } catch { /* sem storage */ }

  if (typeof API !== 'undefined') {
    const dot = document.getElementById('api-dot');
    const label = document.getElementById('api-label');
    API.departamentos.listar()
      .then(() => { dot.classList.add('online'); label.textContent = 'API conectada'; })
      .catch(() => { dot.classList.add('offline'); label.textContent = 'API indisponível'; });
  }
})();
