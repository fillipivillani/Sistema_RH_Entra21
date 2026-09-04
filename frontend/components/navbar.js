(function () {
  const container = document.getElementById('site-navbar');
  if (!container) return;

  const paginaAtual = location.pathname.split('/').pop() || 'inicio.html';

  container.innerHTML = `
    <nav class="navbar-sidebar" id="navbar-sidebar">
      <a href="inicio.html" class="navbar-brand-section">
        <div class="navbar-brand-icon">RH</div>
        <span>Sistema RH</span>
      </a>
      <ul class="navbar-nav-sidebar">
        <li><a href="inicio.html" class="nav-link-sidebar ${paginaAtual === 'inicio.html' ? 'active' : ''}">Início</a></li>
        <li><a href="beneficios.html" class="nav-link-sidebar ${paginaAtual === 'beneficios.html' ? 'active' : ''}">Benefícios</a></li>
        <li><a href="funcionarios.html" class="nav-link-sidebar ${paginaAtual === 'funcionarios.html' ? 'active' : ''}">Funcionários</a></li>
        <li><a href="cargos.html" class="nav-link-sidebar ${paginaAtual === 'cargos.html' ? 'active' : ''}">Cargos</a></li>
        <li><a href="recrutamento.html" class="nav-link-sidebar ${paginaAtual === 'recrutamento.html' ? 'active' : ''}">Recrutamento</a></li>
        <li><a href="departamentos.html" class="nav-link-sidebar ${paginaAtual === 'departamentos.html' ? 'active' : ''}">Departamentos</a></li>
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
