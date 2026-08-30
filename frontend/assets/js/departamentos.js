document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('departamentos-container');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty-state');
  const alerta = document.getElementById('alerta');
  const alertaMsg = document.getElementById('alerta-msg');
  const form = document.getElementById('form-departamento');
  const modal = new bootstrap.Modal(document.getElementById('departamentoModal'));
  const deleteModal = new bootstrap.Modal(document.getElementById('modal-delete'));
  const podeEditar = typeof API?.departamentos?.atualizar === 'function';

  let departamentos = [];
  let deleteTargetId = null;

  document.getElementById('input-descricao').addEventListener('input', (e) => {
    document.getElementById('char-count').textContent = `${e.target.value.length}/${e.target.maxLength}`;
  });

  document.querySelectorAll('[data-bs-target="#departamentoModal"]').forEach((btn) => btn.addEventListener('click', resetForm));
  document.getElementById('btn-retry').onclick = carregar;

  function resetForm() {
    form.reset();
    form.classList.remove('was-validated');
    form.id.value = '';
    document.getElementById('modal-title').textContent = 'Novo Departamento';
    document.getElementById('btn-salvar').textContent = 'Salvar';
    document.getElementById('char-count').textContent = '0/240';
    document.getElementById('form-erro').hidden = true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const descricao = form.descricao.value.trim();
    if (!nome) { form.classList.add('was-validated'); form.nome.focus(); return; }

    const btn = document.getElementById('btn-salvar');
    const id = form.id.value || null;
    btn.disabled = true; btn.textContent = 'Salvando...';
    try {
      if (id && podeEditar) await API.departamentos.atualizar(id, { nome, descricao: descricao || null });
      else await API.departamentos.criar({ nome, descricao: descricao || null });
      modal.hide(); resetForm(); await carregar();
    } catch (err) {
      const el = document.getElementById('form-erro');
      el.textContent = err.message || 'Não foi possível salvar.';
      el.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = id ? 'Salvar alterações' : 'Salvar';
    }
  });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const dep = departamentos.find((d) => String(d.id) === btn.dataset.id);
    if (!dep) return;

    if (btn.dataset.action === 'editar') {
      form.id.value = dep.id;
      form.nome.value = dep.nome || '';
      form.descricao.value = dep.descricao || '';
      document.getElementById('char-count').textContent = `${form.descricao.value.length}/240`;
      document.getElementById('modal-title').textContent = 'Editar Departamento';
      document.getElementById('btn-salvar').textContent = 'Salvar alterações';
      modal.show();
    }
    if (btn.dataset.action === 'deletar') {
      deleteTargetId = dep.id;
      document.getElementById('modal-delete-name').textContent = dep.nome || 'este departamento';
      deleteModal.show();
    }
  });

  document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
    if (deleteTargetId == null) return;
    const btn = document.getElementById('btn-confirm-delete');
    btn.disabled = true; btn.textContent = 'Excluindo...';
    try {
      await API.departamentos.deletar(deleteTargetId);
      deleteModal.hide(); await carregar();
    } catch (err) {
      deleteModal.hide();
      alertaMsg.textContent = err.message || 'Não foi possível excluir.';
      alerta.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Excluir';
      deleteTargetId = null;
    }
  });

  async function carregar() {
    loading.hidden = false;
    container.innerHTML = '';
    empty.hidden = true;
    alerta.hidden = true;
    document.getElementById('results-summary').textContent = 'Carregando...';
    try {
      departamentos = [...(await API.departamentos.listar())].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
      loading.hidden = true;
      if (!departamentos.length) {
        empty.hidden = false;
        document.getElementById('results-summary').textContent = 'Nenhum departamento cadastrado';
        return;
      }
      document.getElementById('results-summary').textContent = `${departamentos.length} departamento${departamentos.length === 1 ? '' : 's'}`;
      container.innerHTML = departamentos.map((d) => {
        const desc = (d.descricao || '').trim();
        const ini = RH.escapeHtml((d.nome || '?').trim().charAt(0).toUpperCase());
        return `<div class="col-md-6 col-lg-4"><div class="departamento-card">
          <div class="departamento-header"><span class="departamento-avatar">${ini}</span>
          <h3 class="departamento-name">${RH.escapeHtml(d.nome)}</h3></div>
          <div class="departamento-body"><p class="departamento-description${desc ? '' : ' is-empty'}">${desc ? RH.escapeHtml(desc) : 'Sem descrição'}</p></div>
          <div class="departamento-footer">
            ${podeEditar ? `<button class="btn btn-sm btn-outline-secondary" data-action="editar" data-id="${d.id}">Editar</button>` : ''}
            <button class="btn btn-sm btn-outline-danger" data-action="deletar" data-id="${d.id}">Deletar</button>
          </div></div></div>`;
      }).join('');
    } catch (err) {
      loading.hidden = true;
      document.getElementById('results-summary').textContent = '';
      alertaMsg.textContent = err.message || 'Erro ao carregar departamentos.';
      alerta.hidden = false;
    }
  }

  carregar();
});