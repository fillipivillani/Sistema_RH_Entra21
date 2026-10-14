document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const grid = $('grid');
  const estado = $('estado');
  const form = $('form-dep');
  const modal = new bootstrap.Modal($('modal-dep'));

  let departamentos = [];
  let funcionarios = [];
  let cargos = [];

  async function carregar() {
    grid.innerHTML = RH.skeletonCards(6);
    estado.innerHTML = '';
    $('summary').textContent = 'Carregando...';
    try {
      const [deps, funcs, cgs] = await Promise.all([
        API.departamentos.listar(),
        API.funcionarios.listar().catch(() => []),
        API.cargos.listar().catch(() => []),
      ]);
      departamentos = (deps || []).sort(RH.byText('nome'));
      funcionarios = funcs || [];
      cargos = cgs || [];
      render();
    } catch (err) {
      grid.innerHTML = '';
      $('summary').textContent = '';
      estado.innerHTML = `<div class="panel">${RH.errorState(err.message)}</div>`;
      $('btn-retry').onclick = carregar;
    }
  }

  function render() {
    const busca = RH.normalize($('f-busca').value.trim());
    const status = $('f-status').value;
    const lista = departamentos.filter((d) =>
      (!busca || RH.normalize(d.nome).includes(busca) || RH.normalize(d.descricao).includes(busca)) &&
      (!status || (status === 'ativo') === (d.ativo !== false)));

    const ativos = departamentos.filter((d) => d.ativo !== false).length;
    $('summary').textContent = `${RH.plural(departamentos.length, 'departamento', 'departamentos')} · ${RH.plural(ativos, 'ativo', 'ativos')}`;

    if (!lista.length) {
      grid.innerHTML = '';
      estado.innerHTML = `<div class="panel">${departamentos.length
        ? RH.stateHtml({ icon: 'bi-search', title: 'Nenhum resultado', text: 'Nenhum departamento corresponde aos filtros.' })
        : RH.stateHtml({ icon: 'bi-building', title: 'Nenhum departamento cadastrado', text: 'Crie o primeiro departamento da empresa.', action: '<button class="btn btn-primary" data-novo><i class="bi bi-plus-lg"></i> Novo departamento</button>' })}</div>`;
      estado.querySelector('[data-novo]')?.addEventListener('click', abrirNovo);
      return;
    }

    estado.innerHTML = '';
    grid.innerHTML = lista.map((d) => {
      const nFunc = funcionarios.filter((f) => f.departamento?.id === d.id).length;
      const nCargo = cargos.filter((c) => c.departamento?.id === d.id).length;
      const cor = RH.colorFor(d.nome);
      return `<div class="col-md-6 col-xl-4 fade-in"><article class="entity-card">
        <div class="entity-head">
          <span class="entity-icon" style="background:${cor}1f;color:${cor}"><i class="bi bi-building"></i></span>
          <div class="flex-grow-1 min-w-0">
            <h3 class="entity-title">${RH.escapeHtml(d.nome)}</h3>
            <div class="mt-1">${RH.statusBadge(d.ativo)}</div>
          </div>
        </div>
        <div class="entity-body"><p class="mb-0 line-clamp-2">${d.descricao ? RH.escapeHtml(d.descricao) : '<span class="text-subtle">Sem descrição</span>'}</p></div>
        <div class="entity-stats">
          <div class="entity-stat"><strong>${nFunc}</strong><span>${nFunc === 1 ? 'Funcionário' : 'Funcionários'}</span></div>
          <div class="entity-stat"><strong>${nCargo}</strong><span>${nCargo === 1 ? 'Cargo' : 'Cargos'}</span></div>
        </div>
        <div class="entity-foot">
          <button class="btn btn-icon" data-action="editar" data-id="${d.id}" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-icon danger" data-action="excluir" data-id="${d.id}" title="Excluir"><i class="bi bi-trash3"></i></button>
        </div>
      </article></div>`;
    }).join('');
  }

  function abrirNovo() {
    RH.resetForm(form);
    form.editId.value = '';
    form.ativo.checked = true;
    $('dep-count').textContent = '0';
    $('modal-dep-title').textContent = 'Novo departamento';
    modal.show();
  }

  function abrirEdicao(d) {
    RH.resetForm(form);
    form.editId.value = d.id;
    form.nome.value = d.nome || '';
    form.descricao.value = d.descricao || '';
    form.ativo.checked = d.ativo !== false;
    $('dep-count').textContent = form.descricao.value.length;
    $('modal-dep-title').textContent = 'Editar departamento';
    modal.show();
  }

  $('btn-novo').addEventListener('click', abrirNovo);
  $('modal-dep').addEventListener('shown.bs.modal', () => form.nome.focus());
  form.descricao.addEventListener('input', () => { $('dep-count').textContent = form.descricao.value.length; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError(form, null);
    const nome = form.nome.value.trim();
    form.nome.classList.toggle('is-invalid', !nome);
    if (!nome) return form.nome.focus();

    const dados = { nome, descricao: form.descricao.value.trim() || null, ativo: form.ativo.checked };
    const id = form.editId.value;
    const btn = $('btn-salvar');
    RH.busy(btn, true);
    try {
      if (id) await API.departamentos.atualizar(id, dados);
      else await API.departamentos.criar(dados);
      modal.hide();
      RH.success(id ? 'Departamento atualizado.' : `Departamento "${nome}" criado.`);
      await carregar();
    } catch (err) {
      RH.formError(form, err.message);
    } finally {
      RH.busy(btn, false);
    }
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const d = departamentos.find((x) => String(x.id) === btn.dataset.id);
    if (!d) return;
    if (btn.dataset.action === 'editar') abrirEdicao(d);
    if (btn.dataset.action === 'excluir') {
      const nCargo = cargos.filter((c) => c.departamento?.id === d.id).length;
      RH.confirm({
        title: 'Excluir departamento',
        message: `Tem certeza que deseja excluir <strong>${RH.escapeHtml(d.nome)}</strong>?${nCargo ? ` Os ${nCargo} cargo(s) vinculados também serão removidos.` : ''} Essa ação não pode ser desfeita.`,
        onConfirm: () => API.departamentos.deletar(d.id),
      }).then((ok) => {
        if (!ok) return;
        RH.success(`Departamento "${d.nome}" excluído.`);
        carregar();
      });
    }
  });

  $('f-busca').addEventListener('input', RH.debounce(render, 200));
  $('f-status').addEventListener('change', render);
  $('filters').addEventListener('submit', (e) => e.preventDefault());

  carregar();
});
