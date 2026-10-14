document.addEventListener('DOMContentLoaded', () => {
  const PAGE_SIZE = 10;
  const tbody = document.querySelector('#tabela tbody');
  const estado = document.getElementById('estado');
  const form = document.getElementById('filters');
  const $ = (id) => document.getElementById(id);
  const drawer = new bootstrap.Offcanvas($('detalhe'));

  let funcionarios = [];
  let pagina = 1;
  let sort = { key: 'nome', dir: 1 };

  const sortValue = {
    nome: (f) => RH.normalize(f.nome),
    cargo: (f) => RH.normalize(f.cargo?.nome),
    dataAdmissao: (f) => f.dataAdmissao || '',
    salario: (f) => Number(f.salario) || 0,
  };

  async function carregar() {
    tbody.innerHTML = RH.skeletonRows(7);
    estado.innerHTML = '';
    $('summary').textContent = 'Carregando...';
    try {
      const [funcs, deps, cargos] = await Promise.all([
        API.funcionarios.listar(), API.departamentos.listar(), API.cargos.listar(),
      ]);
      funcionarios = funcs || [];
      RH.fillSelect('f-dep', [...deps].sort(RH.byText('nome')), { first: 'Todos os departamentos', selected: $('f-dep').value });
      RH.fillSelect('f-cargo', [...cargos].sort(RH.byText('nome')), { first: 'Todos os cargos', selected: $('f-cargo').value });
      render();
    } catch (err) {
      tbody.innerHTML = '';
      $('summary').textContent = '';
      estado.innerHTML = RH.errorState(err.message);
      $('btn-retry').onclick = carregar;
    }
  }

  function filtrados() {
    const busca = RH.normalize($('f-busca').value.trim());
    const buscaDig = RH.onlyDigits(busca);
    const dep = $('f-dep').value;
    const cargo = $('f-cargo').value;
    const status = $('f-status').value;
    return funcionarios.filter((f) =>
      (!busca || RH.normalize(f.nome).includes(busca) || RH.normalize(f.email).includes(busca) || (buscaDig && RH.onlyDigits(f.cpf).includes(buscaDig))) &&
      (!dep || String(f.departamento?.id) === dep) &&
      (!cargo || String(f.cargo?.id) === cargo) &&
      (!status || (status === 'ativo') === (f.status !== false)));
  }

  function render() {
    const lista = filtrados().sort((a, b) => {
      const va = sortValue[sort.key](a), vb = sortValue[sort.key](b);
      return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir;
    });

    $('summary').textContent = lista.length === funcionarios.length
      ? `${RH.plural(funcionarios.length, 'funcionário cadastrado', 'funcionários cadastrados')}`
      : `${lista.length} de ${funcionarios.length} funcionários`;

    document.querySelectorAll('th[data-sort] i').forEach((i) => {
      const k = i.parentElement.dataset.sort;
      i.className = `bi ${k === sort.key ? (sort.dir > 0 ? 'bi-sort-up' : 'bi-sort-down') : 'bi-arrow-down-up'}`;
    });

    if (!lista.length) {
      tbody.innerHTML = '';
      estado.innerHTML = funcionarios.length
        ? RH.stateHtml({ icon: 'bi-search', title: 'Nenhum resultado', text: 'Ajuste os filtros para encontrar quem você procura.' })
        : RH.stateHtml({ icon: 'bi-people', title: 'Nenhum funcionário cadastrado', text: 'Comece adicionando a primeira pessoa do time.', action: '<a href="funcionario-form.html" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Novo funcionário</a>' });
      RH.renderPagination($('pagination'), $('page-info'), { total: 0 });
      return;
    }

    estado.innerHTML = '';
    const pg = RH.paginate(lista, pagina, PAGE_SIZE);
    pagina = pg.page;
    tbody.innerHTML = pg.items.map((f) => `<tr class="fade-in">
      <td><div class="cell-person">${RH.avatar(f.nome, f.foto)}
        <div><div class="name">${RH.escapeHtml(f.nome)}</div><div class="meta">${RH.escapeHtml(f.email || '—')}</div></div></div></td>
      <td class="text-nowrap d-none d-xxl-table-cell">${RH.formatCPF(f.cpf)}</td>
      <td><div class="fw-medium">${RH.escapeHtml(f.cargo?.nome || '—')}</div><div class="small text-muted">${RH.escapeHtml(f.departamento?.nome || '—')}</div></td>
      <td class="text-nowrap">${RH.formatDate(f.dataAdmissao)}</td>
      <td class="text-end text-nowrap">${RH.formatCurrency(f.salario)}</td>
      <td>${RH.statusBadge(f.status)}</td>
      <td class="text-end"><div class="row-actions">
        <button class="btn btn-icon" data-action="ver" data-id="${f.id}" title="Detalhes"><i class="bi bi-eye"></i></button>
        <a class="btn btn-icon" href="funcionario-form.html?id=${f.id}" title="Editar"><i class="bi bi-pencil"></i></a>
        <button class="btn btn-icon danger" data-action="excluir" data-id="${f.id}" title="Excluir"><i class="bi bi-trash3"></i></button>
      </div></td>
    </tr>`).join('');

    RH.renderPagination($('pagination'), $('page-info'), {
      page: pg.page, pages: pg.pages, total: lista.length, size: PAGE_SIZE,
      onPage: (p) => { pagina = p; render(); },
    });
  }

  function detalhe(f) {
    const item = (label, v) => `<div><dt>${label}</dt><dd>${v}</dd></div>`;
    $('detalhe-body').innerHTML = `
      <div class="profile-card border-bottom">
        ${RH.avatar(f.nome, f.foto, 'avatar-xl')}
        <h3>${RH.escapeHtml(f.nome)}</h3>
        <p class="text-muted mb-2">${RH.escapeHtml(f.cargo?.nome || '—')} · ${RH.escapeHtml(f.departamento?.nome || '—')}</p>
        ${RH.statusBadge(f.status)}
      </div>
      <div class="p-4">
        <h6 class="text-uppercase small text-subtle fw-bold mb-3">Dados pessoais</h6>
        <dl class="dl-grid mb-4">
          ${item('CPF', RH.formatCPF(f.cpf))}
          ${item('RG', RH.escapeHtml(f.rg || '—'))}
          ${item('Nascimento', RH.formatDate(f.dataNascimento))}
          ${item('Telefone', RH.formatPhone(f.telefone))}
          ${item('E-mail', RH.escapeHtml(f.email || '—'))}
          ${item('Endereço', RH.escapeHtml(f.endereco || '—'))}
        </dl>
        <h6 class="text-uppercase small text-subtle fw-bold mb-3">Contrato</h6>
        <dl class="dl-grid">
          ${item('Admissão', RH.formatDate(f.dataAdmissao))}
          ${item('Salário', RH.formatCurrency(f.salario))}
          ${item('CBO', RH.escapeHtml(f.cargo?.cboCodigo || '—'))}
        </dl>
      </div>
      <div class="p-4 pt-0 d-flex gap-2 flex-wrap">
        <a href="funcionario-form.html?id=${f.id}" class="btn btn-primary flex-fill"><i class="bi bi-pencil"></i> Editar</a>
        <a href="movimentacoes.html?funcionario=${f.id}" class="btn btn-soft flex-fill"><i class="bi bi-arrow-left-right"></i> Movimentar</a>
      </div>`;
    drawer.show();
  }

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const f = funcionarios.find((x) => String(x.id) === btn.dataset.id);
    if (!f) return;
    if (btn.dataset.action === 'ver') detalhe(f);
    if (btn.dataset.action === 'excluir') {
      RH.confirm({
        title: 'Excluir funcionário',
        message: `Tem certeza que deseja excluir <strong>${RH.escapeHtml(f.nome)}</strong>? Essa ação não pode ser desfeita.`,
        onConfirm: () => API.funcionarios.deletar(f.id),
      }).then((ok) => {
        if (!ok) return;
        funcionarios = funcionarios.filter((x) => x.id !== f.id);
        render();
        RH.success(`${f.nome} foi excluído.`);
      });
    }
  });

  document.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    sort = { key: k, dir: sort.key === k ? -sort.dir : 1 };
    render();
  }));

  const refiltrar = () => { pagina = 1; render(); };
  $('f-busca').addEventListener('input', RH.debounce(refiltrar, 200));
  ['f-dep', 'f-cargo', 'f-status'].forEach((id) => $(id).addEventListener('change', refiltrar));
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => setTimeout(refiltrar));

  carregar();
});
