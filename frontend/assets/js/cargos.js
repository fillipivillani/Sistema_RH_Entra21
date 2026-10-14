document.addEventListener('DOMContentLoaded', () => {
  const PAGE_SIZE = 10;
  const $ = (id) => document.getElementById(id);
  const tbody = document.querySelector('#tabela tbody');
  const estado = $('estado');
  const form = $('form-cargo');
  const modal = new bootstrap.Modal($('modal-cargo'));

  let cargos = [];
  let departamentos = [];
  let funcionarios = [];
  let pagina = 1;

  async function carregar() {
    tbody.innerHTML = RH.skeletonRows(6);
    estado.innerHTML = '';
    $('summary').textContent = 'Carregando...';
    try {
      const [cgs, deps, funcs] = await Promise.all([
        API.cargos.listar(), API.departamentos.listar(), API.funcionarios.listar().catch(() => []),
      ]);
      cargos = (cgs || []).sort(RH.byText('nome'));
      departamentos = (deps || []).sort(RH.byText('nome'));
      funcionarios = funcs || [];
      RH.fillSelect('f-dep', departamentos, { first: 'Todos os departamentos', selected: $('f-dep').value });
      render();
    } catch (err) {
      tbody.innerHTML = '';
      $('summary').textContent = '';
      estado.innerHTML = RH.errorState(err.message);
      $('btn-retry').onclick = carregar;
    }
  }

  function render() {
    const busca = RH.normalize($('f-busca').value.trim());
    const dep = $('f-dep').value;
    const status = $('f-status').value;
    const lista = cargos.filter((c) =>
      (!busca || RH.normalize(c.nome).includes(busca) || RH.normalize(c.cboCodigo).includes(busca)) &&
      (!dep || String(c.departamento?.id) === dep) &&
      (!status || (status === 'ativo') === (c.ativo !== false)));

    $('summary').textContent = lista.length === cargos.length
      ? RH.plural(cargos.length, 'cargo cadastrado', 'cargos cadastrados')
      : `${lista.length} de ${cargos.length} cargos`;

    if (!lista.length) {
      tbody.innerHTML = '';
      estado.innerHTML = cargos.length
        ? RH.stateHtml({ icon: 'bi-search', title: 'Nenhum resultado', text: 'Ajuste os filtros para encontrar o cargo.' })
        : RH.stateHtml({ icon: 'bi-briefcase', title: 'Nenhum cargo cadastrado', text: 'Cargos organizam as funções de cada departamento.', action: '<button class="btn btn-primary" data-novo><i class="bi bi-plus-lg"></i> Novo cargo</button>' });
      estado.querySelector('[data-novo]')?.addEventListener('click', abrirNovo);
      RH.renderPagination($('pagination'), $('page-info'), { total: 0 });
      return;
    }

    estado.innerHTML = '';
    const pg = RH.paginate(lista, pagina, PAGE_SIZE);
    pagina = pg.page;
    tbody.innerHTML = pg.items.map((c) => {
      const n = funcionarios.filter((f) => f.cargo?.id === c.id).length;
      const cor = RH.colorFor(c.departamento?.nome);
      return `<tr class="fade-in">
        <td><div class="cell-person">
          <span class="entity-icon" style="width:40px;height:40px;font-size:1rem;background:${cor}1f;color:${cor}"><i class="bi bi-briefcase"></i></span>
          <div><div class="name">${RH.escapeHtml(c.nome)}</div><div class="meta line-clamp-2">${RH.escapeHtml(c.descricao || 'Sem descrição')}</div></div>
        </div></td>
        <td>${c.cboCodigo ? `<span class="chip">${RH.escapeHtml(c.cboCodigo)}</span>` : '<span class="text-subtle">—</span>'}</td>
        <td>${RH.escapeHtml(c.departamento?.nome || '—')}</td>
        <td class="text-center">${n}</td>
        <td>${RH.statusBadge(c.ativo)}</td>
        <td class="text-end"><div class="row-actions">
          <button class="btn btn-icon" data-action="editar" data-id="${c.id}" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-icon danger" data-action="excluir" data-id="${c.id}" title="Excluir"><i class="bi bi-trash3"></i></button>
        </div></td>
      </tr>`;
    }).join('');

    RH.renderPagination($('pagination'), $('page-info'), {
      page: pg.page, pages: pg.pages, total: lista.length, size: PAGE_SIZE,
      onPage: (p) => { pagina = p; render(); },
    });
  }

  function abrirNovo() {
    if (!departamentos.length) {
      RH.error('Cadastre um departamento antes de criar cargos.');
      return;
    }
    RH.resetForm(form);
    form.editId.value = '';
    form.ativo.checked = true;
    RH.fillSelect('cargo-dep', departamentos, { selected: $('f-dep').value });
    $('modal-cargo-title').textContent = 'Novo cargo';
    modal.show();
  }

  function abrirEdicao(c) {
    RH.resetForm(form);
    form.editId.value = c.id;
    form.nome.value = c.nome || '';
    form.cboCodigo.value = c.cboCodigo || '';
    form.cboDescricao.value = c.cboDescricao || '';
    form.descricao.value = c.descricao || '';
    form.ativo.checked = c.ativo !== false;
    RH.fillSelect('cargo-dep', departamentos, { selected: c.departamento?.id });
    $('modal-cargo-title').textContent = 'Editar cargo';
    modal.show();
  }

  $('btn-novo').addEventListener('click', abrirNovo);
  $('modal-cargo').addEventListener('shown.bs.modal', () => form.nome.focus());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError(form, null);
    const nome = form.nome.value.trim();
    const departamentoId = form.departamentoId.value;
    form.nome.classList.toggle('is-invalid', !nome);
    form.departamentoId.classList.toggle('is-invalid', !departamentoId);
    if (!nome || !departamentoId) return;

    const dados = {
      nome,
      cboCodigo: form.cboCodigo.value.trim() || null,
      cboDescricao: form.cboDescricao.value.trim() || null,
      descricao: form.descricao.value.trim() || null,
      ativo: form.ativo.checked,
      departamentoId: Number(departamentoId),
    };
    const id = form.editId.value;
    const btn = $('btn-salvar');
    RH.busy(btn, true);
    try {
      if (id) await API.cargos.atualizar(id, dados);
      else await API.cargos.criar(dados);
      modal.hide();
      RH.success(id ? 'Cargo atualizado.' : `Cargo "${nome}" criado.`);
      await carregar();
    } catch (err) {
      RH.formError(form, err.message);
    } finally {
      RH.busy(btn, false);
    }
  });

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const c = cargos.find((x) => String(x.id) === btn.dataset.id);
    if (!c) return;
    if (btn.dataset.action === 'editar') abrirEdicao(c);
    if (btn.dataset.action === 'excluir') {
      RH.confirm({
        title: 'Excluir cargo',
        message: `Tem certeza que deseja excluir o cargo <strong>${RH.escapeHtml(c.nome)}</strong>? Essa ação não pode ser desfeita.`,
        onConfirm: () => API.cargos.deletar(c.id),
      }).then((ok) => {
        if (!ok) return;
        cargos = cargos.filter((x) => x.id !== c.id);
        render();
        RH.success(`Cargo "${c.nome}" excluído.`);
      });
    }
  });

  const refiltrar = () => { pagina = 1; render(); };
  $('f-busca').addEventListener('input', RH.debounce(refiltrar, 200));
  ['f-dep', 'f-status'].forEach((id) => $(id).addEventListener('change', refiltrar));
  $('filters').addEventListener('submit', (e) => e.preventDefault());
  $('filters').addEventListener('reset', () => setTimeout(refiltrar));

  carregar();
});
