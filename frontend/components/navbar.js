(function () {
  const container = document.getElementById('site-navbar');
  if (!container) return;

  const paginaAtual = location.pathname.split('/').pop() || 'dashboard.html';

  container.innerHTML = `
    <nav class="navbar-sidebar" id="navbar-sidebar">
      <a href="dashboard.html" class="navbar-brand-section">
        <div class="navbar-brand-icon">RH</div>
        <span>Sistema RH</span>
      </a>
      <ul class="navbar-nav-sidebar">
        <li><a href="dashboard.html" class="nav-link-sidebar ${paginaAtual === 'dashboard.html' ? 'active' : ''}">Dashboard</a></li>
        <li><a href="funcionarios.html" class="nav-link-sidebar ${paginaAtual === 'funcionarios.html' ? 'active' : ''}">Funcionários</a></li>
        <li><a href="departamentos.html" class="nav-link-sidebar ${paginaAtual === 'departamentos.html' ? 'active' : ''}">Departamentos</a></li>
        <li><a href="funcionario-cadastro.html" class="nav-link-sidebar ${paginaAtual === 'funcionario-cadastro.html' ? 'active' : ''}">Novo Funcionário</a></li>
      </ul>
    </nav>
    <button class="navbar-toggle-sidebar" id="navbar-toggle" title="Menu">☰</button>
  `;

  const toggle = container.querySelector('#navbar-toggle');
  const sidebar = container.querySelector('.navbar-sidebar');

  toggle?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
    sidebar?.classList.toggle('active');
  });
})();
