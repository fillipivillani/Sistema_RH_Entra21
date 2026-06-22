(function(){
  function render(){
    const container = document.getElementById('site-navbar');
    if(!container) return;
    container.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div class="container-fluid">
          <a class="navbar-brand" href="dashboard.html">Sistema RH</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse" aria-controls="navCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navCollapse">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>
              <li class="nav-item"><a class="nav-link" href="funcionarios.html">Funcionários</a></li>
              <li class="nav-item"><a class="nav-link" href="funcionario-cadastro.html">Novo Funcionário</a></li>
            </ul>
            <form class="d-flex" role="search">
              <input class="form-control me-2" type="search" placeholder="Pesquisar" aria-label="Pesquisar">
              <button class="btn btn-outline-primary" type="submit">Buscar</button>
            </form>
          </div>
        </div>
      </nav>
    `;
    const links = container.querySelectorAll('a.nav-link');
    const currentFile = (function(){
      const href = window.location.href;
      const parts = href.split('/');
      let last = parts.pop() || parts.pop(); 
      return last;
    })();
    links.forEach(a=>{
      const ahref = a.getAttribute('href').split('/').pop();
      if(ahref === currentFile || (currentFile === '' && ahref === 'dashboard.html')){
        a.classList.add('active');
      }
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
