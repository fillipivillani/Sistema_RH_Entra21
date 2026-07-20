document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('departamentos-container');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty-state');
  const alerta = document.getElementById('alerta');
  const form = document.getElementById('form-departamento');
  const modal = document.getElementById('departamentoModal');

  carregar();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const descricao = form.descricao.value.trim();
    if (!nome) return mostrarErro('Informe o nome do departamento');

    try {
      await API.departamentos.criar({ nome, descricao: descricao || null });
      bootstrap.Modal.getInstance(modal)?.hide();
      form.reset();
      carregar();
    } catch (err) {
      mostrarErro(err.message);
    }
  });

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'deletar') {
      if (!confirm('Deletar este departamento?')) return;
      try {
        await API.departamentos.deletar(id);
        carregar();
      } catch (err) {
        mostrarErro(err.message);
      }
    }
  });

  async function carregar() {
    loading.hidden = false;
    container.innerHTML = '';
    empty.hidden = true;
    alerta.hidden = true;

    try {
      const lista = await API.departamentos.listar();
      loading.hidden = true;

      if (!lista.length) {
        empty.hidden = false;
        return;
      }

      container.innerHTML = lista.map((d) => `
        <div class="col-md-6 col-lg-4">
          <div class="departamento-card">
            <div class="departamento-header">
              <h3 class="departamento-name">${d.nome}</h3>
            </div>
            <div class="departamento-body">
              <p class="departamento-description">${d.descricao || 'Sem descrição'}</p>
            </div>
            <div class="departamento-footer">
              <button class="btn btn-sm btn-outline-danger" data-action="deletar" data-id="${d.id}">Deletar</button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      loading.hidden = true;
      mostrarErro(err.message);
    }
  }

  function mostrarErro(msg) {
    alerta.textContent = msg;
    alerta.hidden = false;
  }
});
