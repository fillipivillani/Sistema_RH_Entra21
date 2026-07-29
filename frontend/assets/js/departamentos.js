document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('departamentos-container');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty-state');
  const alerta = document.getElementById('alerta');
  const alertaMsg = document.getElementById('alerta-msg');
  const form = document.getElementById('form-departamento');
  const modalEl = document.getElementById('departamentoModal');
  const modal = new bootstrap.Modal(modalEl);
  const modalTitle = document.getElementById('modal-title');
  const formErro = document.getElementById('form-erro');
  const btnSalvar = document.getElementById('btn-salvar');
  const summary = document.getElementById('results-summary');
  const descricaoEl = document.getElementById('input-descricao');
  const charCount = document.getElementById('char-count');

  const deleteModalEl = document.getElementById('modal-delete');
  const deleteModal = new bootstrap.Modal(deleteModalEl);
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');

  // A API pode ainda não ter suporte a edição — detectamos em tempo de
  // execução para não quebrar a tela caso o método não exista.
  const podeEditar = typeof API?.departamentos?.atualizar === 'function';

  let departamentos = [];
  let deleteTargetId = null;
  let deleteTargetNome = '';

  carregar();

  /* ---------- Contador de caracteres da descrição ---------- */
  descricaoEl.addEventListener('input', () => {
    charCount.textContent = `${descricaoEl.value.length}/${descricaoEl.maxLength}`;
  });

  /* ---------- Abrir modal para criar ---------- */
  document.querySelectorAll('[data-bs-target="#departamentoModal"]').forEach((btn) => {
    btn.addEventListener('click', () => resetForm());
  });

  function resetForm() {
    form.reset();
    form.classList.remove('was-validated');
    form.id.value = '';
    modalTitle.textContent = 'Novo Departamento';
    btnSalvar.textContent = 'Salvar';
    charCount.textContent = '0/240';
    hideFormErro();
  }

  /* ---------- Criar / editar ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormErro();

    const nome = form.nome.value.trim();
    const descricao = form.descricao.value.trim();

    if (!nome) {
      form.classList.add('was-validated');
      form.nome.focus();
      return;
    }

    const id = form.id.value ? Number(form.id.value) : null;

    setSalvando(true);
    try {
      if (id && podeEditar) {
        await API.departamentos.atualizar(id, { nome, descricao: descricao || null });
      } else {
        await API.departamentos.criar({ nome, descricao: descricao || null });
      }
      modal.hide();
      resetForm();
      await carregar();
    } catch (err) {
      mostrarFormErro(err.message || 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  });

  function setSalvando(ativo) {
    btnSalvar.disabled = ativo;
    btnSalvar.textContent = ativo ? 'Salvando...' : (form.id.value ? 'Salvar alterações' : 'Salvar');
  }

  function mostrarFormErro(msg) {
    formErro.textContent = msg;
    formErro.hidden = false;
  }

  function hideFormErro() {
    formErro.hidden = true;
    formErro.textContent = '';
  }

  /* ---------- Ações nos cards (editar / deletar) ---------- */
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const dep = departamentos.find((d) => d.id === id);
    if (!dep) return;

    if (btn.dataset.action === 'editar') {
      form.id.value = dep.id;
      form.nome.value = dep.nome || '';
      form.descricao.value = dep.descricao || '';
      charCount.textContent = `${form.descricao.value.length}/240`;
      form.classList.remove('was-validated');
      hideFormErro();
      modalTitle.textContent = 'Editar Departamento';
      btnSalvar.textContent = 'Salvar alterações';
      modal.show();
    }

    if (btn.dataset.action === 'deletar') {
      deleteTargetId = dep.id;
      deleteTargetNome = dep.nome || 'este departamento';
      document.getElementById('modal-delete-name').textContent = deleteTargetNome;
      deleteModal.show();
    }
  });

  btnConfirmDelete.addEventListener('click', async () => {
    if (deleteTargetId == null) return;
    btnConfirmDelete.disabled = true;
    btnConfirmDelete.textContent = 'Excluindo...';
    try {
      await API.departamentos.deletar(deleteTargetId);
      deleteModal.hide();
      await carregar();
    } catch (err) {
      deleteModal.hide();
      mostrarErroLista(err.message || 'Não foi possível excluir o departamento.');
    } finally {
      btnConfirmDelete.disabled = false;
      btnConfirmDelete.textContent = 'Excluir';
      deleteTargetId = null;
    }
  });

  /* ---------- Retry ---------- */
  document.getElementById('btn-retry').addEventListener('click', carregar);

  /* ---------- Carregar lista ---------- */
  async function carregar() {
    loading.hidden = false;
    container.innerHTML = '';
    empty.hidden = true;
    alerta.hidden = true;
    summary.textContent = 'Carregando...';

    try {
      const lista = await API.departamentos.listar();
      departamentos = [...lista].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
      loading.hidden = true;

      if (!departamentos.length) {
        empty.hidden = false;
        summary.textContent = 'Nenhum departamento cadastrado';
        return;
      }

      summary.textContent = `${departamentos.length} departamento${departamentos.length === 1 ? '' : 's'} cadastrado${departamentos.length === 1 ? '' : 's'}`;
      renderCards(departamentos);
    } catch (err) {
      loading.hidden = true;
      summary.textContent = '';
      mostrarErroLista(err.message || 'Erro ao carregar departamentos.');
    }
  }

  function renderCards(lista) {
    container.innerHTML = lista.map((d) => {
      const inicial = escapeHtml((d.nome || '?').trim().charAt(0).toUpperCase());
      const descricao = (d.descricao || '').trim();
      const descricaoHtml = descricao
        ? escapeHtml(descricao)
        : 'Sem descrição';

      return `
        <div class="col-md-6 col-lg-4">
          <div class="departamento-card">
            <div class="departamento-header">
              <span class="departamento-avatar">${inicial}</span>
              <h3 class="departamento-name">${escapeHtml(d.nome)}</h3>
            </div>
            <div class="departamento-body">
              <p class="departamento-description${descricao ? '' : ' is-empty'}">${descricaoHtml}</p>
            </div>
            <div class="departamento-footer">
              ${podeEditar ? `<button class="btn btn-sm btn-outline-secondary" data-action="editar" data-id="${d.id}">Editar</button>` : ''}
              <button class="btn btn-sm btn-outline-danger" data-action="deletar" data-id="${d.id}">Deletar</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function mostrarErroLista(msg) {
    alertaMsg.textContent = msg;
    alerta.hidden = false;
  }

  function escapeHtml(str) {
    return (str ?? '').toString().replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }
});