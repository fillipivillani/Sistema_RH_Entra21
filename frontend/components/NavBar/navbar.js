(function () {
  function render() {
    const container = document.getElementById('site-navbar');
    if (!container) return;
    
    container.innerHTML = `
      <!-- Sidebar Navigation -->
      <nav class="navbar-sidebar" id="navbar-sidebar">
        <!-- Brand Section -->
        <a href="dashboard.html" class="navbar-brand-section">
          <div class="navbar-brand-icon">RH</div>
          <span>Sistema RH</span>
        </a>

        <!-- Navigation Menu -->
        <ul class="navbar-nav-sidebar" id="navbar-nav-list">
          <li class="nav-item-sidebar">
            <a href="dashboard.html" class="nav-link-sidebar" data-page="dashboard.html">
              <span class="nav-icon-sidebar">📊</span>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item-sidebar">
            <a href="funcionarios.html" class="nav-link-sidebar" data-page="funcionarios.html">
              <span class="nav-icon-sidebar">👥</span>
              <span>Funcionários</span>
            </a>
          </li>
          <li class="nav-item-sidebar">
            <a href="departamentos.html" class="nav-link-sidebar" data-page="departamentos.html">
              <span class="nav-icon-sidebar">🏢</span>
              <span>Departamentos</span>
            </a>
          </li>
          <li class="nav-item-sidebar">
            <a href="funcionario-cadastro.html" class="nav-link-sidebar" data-page="funcionario-cadastro.html">
              <span class="nav-icon-sidebar">➕</span>
              <span>Novo Funcionário</span>
            </a>
          </li>
        </ul>

        <!-- Search Section -->
        <div class="navbar-search-section">
          <form class="search-form" role="search">
            <input type="search" placeholder="Pesquisar..." aria-label="Pesquisar">
            <button type="submit" title="Buscar">🔍</button>
          </form>
        </div>
      </nav>

      <!-- Toggle Button for Mobile -->
      <button class="navbar-toggle-sidebar" id="navbar-toggle" title="Menu">☰</button>

      <!-- Content Wrapper -->
      <div class="content-wrapper" id="content-wrapper"></div>
    `;

    // Set active link based on current page
    const links = container.querySelectorAll('a.nav-link-sidebar');
    const currentFile = (function () {
      const href = window.location.href;
      const parts = href.split('/');
      let last = parts.pop() || parts.pop();
      return last;
    })();

    links.forEach(a => {
      const ahref = a.getAttribute('data-page').split('/').pop();
      if (ahref === currentFile || (currentFile === '' && ahref === 'dashboard.html')) {
        a.classList.add('active');
      }
    });

    // Mobile toggle functionality
    const toggleBtn = container.querySelector('#navbar-toggle');
    const sidebar = container.querySelector('.navbar-sidebar');
    const contentWrapper = container.querySelector('.content-wrapper');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        document.body.classList.toggle('sidebar-open');
        sidebar.classList.toggle('active');
      });

      // Close sidebar when clicking on a link
      const navLinks = container.querySelectorAll('.nav-link-sidebar');
      navLinks.forEach(link => {
        link.addEventListener('click', function () {
          if (window.innerWidth <= 768) {
            document.body.classList.remove('sidebar-open');
            sidebar.classList.remove('active');
          }
        });
      });

      // Close sidebar when clicking outside (on overlay)
      document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          document.body.classList.remove('sidebar-open');
          sidebar.classList.remove('active');
        }
      });
    }

    // Handle window resize
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        document.body.classList.remove('sidebar-open');
        if (sidebar) sidebar.classList.remove('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
