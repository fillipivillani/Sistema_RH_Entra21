document.addEventListener('DOMContentLoaded', () => {
  const PAGE_SIZE = 10;
  const TIPOS = [
    { nome: 'Vale-Transporte', icon: 'bi-bus-front' },
    { nome: 'Vale-Refeição', icon: 'bi-cup-hot' },
    { nome: 'Vale-Alimentação', icon: 'bi-basket' },
    { nome: 'Plano de Saúde', icon: 'bi-heart-pulse' },
    { nome: 'Plano Odontológico', icon: 'bi-emoji-smile' },
    { nome: 'Seguro de Vida', icon: 'bi-shield-check' },
    { nome: 'Auxílio Creche', icon: 'bi-balloon' },
    { nome: 'Gympass / Academia', icon: 'bi-bicycle' },
    { nome: 'Outros', icon: 'bi-gift' },
  ];
  const SITUACAO = { ATIVO: ['Ativo', 'success'], SUSPENSO: ['Suspenso', 'warning'], ENCERRADO: ['Encerrado', 'danger'] };

  const $ = (id) => document.getElementById(id);
  const tbody = document.querySelector('#tabela tbody');
  const estado = $('estado');
  const form = $('form-ben');
  const modal = new bootstrap.Modal($('modal-ben'));

  let beneficios = [];
  let funcionarios = [];
  let pagina = 1;

  const funcId = (b) => b.funcionario?.id ?? b.funcionarioId;
  const funcDe = (b) => b.funcionario || funcionarios.find((f) => f.id === funcId(b));

  RH.fillSelect('f-tipo', TIPOS, { value: 'nome', first: 'Todos os tipos' });
  RH.fillSelect('ben-tipo', TIPOS, { value: 'nome' });

  async function carregar() {
    tbody.innerHTML = RH.skeletonRows(7);
    estado.innerHTML = '';
    $('summary').textContent = 'Carregando...';
    try {
      const [bens, funcs] = await Promise.all([API.beneficios.listar(), API.funcionarios.listar().catch(() => [])]);
      beneficios = bens || [];
      funcionarios = (funcs || []).sort(RH.byText('nome'));
      render();
    } catch (err) {
      tbody.innerHTML = '';
      $('summary').textContent = '';
      estado.innerHTML = err.status === 404
        ? RH.stateHtml({ icon: 'bi-cone-striped', title: 'Módulo aguardando o backend', text: 'Os endpoints de benefícios (/api/v1/beneficio) ainda não foram implementados na API.' })
        : RH.errorState(err.message);
      $('btn-retry')?.addEventListener('click', carregar);
    }
  }

  function render() {
    const ativos = beneficios.filter((b) => (b.situacao || 'ATIVO') === 'ATIVO');
    $('k-ativos').textContent = ativos.length;
    $('k-custo').textContent = RH.formatCurrency(ativos.reduce((s, b) => s + (Number(b.valorMensal) || 0), 0));
    $('k-func').textContent = new Set(ativos.map(funcId)).size;

    const busca = RH.normalize($('f-busca').value.trim());
    const tipo = $('f-tipo').value;
    const sit = $('f-situacao').value;
    const lista = beneficios.filter((b) =>
      (!busca || RH.normalize(funcDe(b)?.nome).includes(busca) || RH.normalize(b.operadora).includes(busca)) &&
      (!tipo || b.tipo === tipo) &&
      (!sit || (b.situacao || 'ATIVO') === sit))
      .sort((a, b) => RH.normalize(funcDe(a)?.nome).localeCompare(RH.normalize(funcDe(b)?.nome)));

    $('summary').textContent = lista.length === beneficios.length
      ? RH.plural(beneficios.length, 'benefício concedido', 'benefícios concedidos')
      : `${lista.length} de ${beneficios.length} benefícios`;

    if (!lista.length) {
      tbody.innerHTML = '';
      estado.innerHTML = beneficios.length
        ? RH.stateHtml({ icon: 'bi-search', title: 'Nenhum resultado', text: 'Ajuste os filtros.' })
        : RH.stateHtml({ icon: 'bi-gift', title: 'Nenhum benefício concedido', text: 'Registre vales, planos e auxílios dos funcionários.', action: '<button class="btn btn-primary" data-novo><i class="bi bi-plus-lg"></i> Novo benefício</button>' });
      estado.querySelector('[data-novo]')?.addEventListener('click', () => abrir());
      RH.renderPagination($('pagination'), $('page-info'), { total: 0 });
      return;
    }

    estado.innerHTML = '';
    const pg = RH.paginate(lista, pagina, PAGE_SIZE);
    pagina = pg.page;
    tbody.innerHTML = pg.items.map((b) => {
      const f = funcDe(b);
      const t = TIPOS.find((x) => x.nome === b.tipo) || TIPOS[TIPOS.length - 1];
      const [sLabel, sTone] = SITUACAO[b.situacao] || SITUACAO.ATIVO;
      return `<tr class="fade-in">
        <td><div class="cell-person">${RH.avatar(f?.nome, f?.foto)}
          <div><div class="name">${RH.escapeHtml(f?.nome || 'Funcionário removido')}</div><div class="meta">${RH.escapeHtml(f?.departamento?.nome || '—')}</div></div></div></td>
        <td><div class="d-flex align-items-center gap-2"><i class="bi ${t.icon} text-primary"></i>
          <div><div class="fw-semibold">${RH.escapeHtml(b.tipo || '—')}</div><div class="small text-muted">${RH.escapeHtml(b.operadora || '')}</div></div></div></td>
        <td class="text-end text-nowrap">${RH.formatCurrency(b.valorMensal)}</td>
        <td class="text-end">${Number(b.percentualDesconto) ? `${Number(b.percentualDesconto).toLocaleString('pt-BR')}%` : '—'}</td>
        <td class="text-nowrap small">${RH.formatDate(b.dataInicio)}${b.dataTermino ? ` – ${RH.formatDate(b.dataTermino)}` : ' – atual'}</td>
        <td>${RH.badge(sLabel, sTone)}</td>
        <td class="text-end"><div class="row-actions">
          <button class="btn btn-icon" data-action="editar" data-id="${b.id}" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-icon danger" data-action="excluir" data-id="${b.id}" title="Excluir"><i class="bi bi-trash3"></i></button>
        </div></td>
      </tr>`;
    }).join('');

    RH.renderPagination($('pagination'), $('page-info'), {
      page: pg.page, pages: pg.pages, total: lista.length, size: PAGE_SIZE,
      onPage: (p) => { pagina = p; render(); },
    });
  }

  function abrir(b) {
    if (!funcionarios.length) return RH.error('Cadastre funcionários antes de conceder benefícios.');
    RH.resetForm(form);
    RH.fillSelect('ben-func', funcionarios, { label: (f) => `${f.nome} — ${f.departamento?.nome || ''}`, selected: b ? funcId(b) : null });
    form.editId.value = b?.id ?? '';
    if (b) {
      form.tipo.value = b.tipo || '';
      form.operadora.value = b.operadora || '';
      form.valorMensal.value = b.valorMensal ?? '';
      form.percentualDesconto.value = b.percentualDesconto ?? 0;
      form.dataInicio.value = b.dataInicio || '';
      form.dataTermino.value = b.dataTermino || '';
      form.situacao.value = b.situacao || 'ATIVO';
      form.observacoes.value = b.observacoes || '';
    } else {
      form.dataInicio.value = new Date().toISOString().slice(0, 10);
    }
    $('modal-ben-title').textContent = b ? 'Editar benefício' : 'Novo benefício';
    modal.show();
  }

  $('btn-novo').addEventListener('click', () => abrir());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError(form, null);
    const dados = {
      funcionarioId: Number(form.funcionarioId.value) || null,
      tipo: form.tipo.value,
      operadora: form.operadora.value.trim() || null,
      valorMensal: Number(form.valorMensal.value),
      percentualDesconto: Number(form.percentualDesconto.value) || 0,
      dataInicio: form.dataInicio.value,
      dataTermino: form.dataTermino.value || null,
      situacao: form.situacao.value,
      observacoes: form.observacoes.value.trim() || null,
    };
    const regras = [
      ['funcionarioId', !dados.funcionarioId],
      ['tipo', !dados.tipo],
      ['valorMensal', !(dados.valorMensal >= 0) || form.valorMensal.value === ''],
      ['dataInicio', !dados.dataInicio],
      ['dataTermino', dados.dataTermino && dados.dataTermino < dados.dataInicio],
    ];
    regras.forEach(([k, inv]) => form[k].classList.toggle('is-invalid', !!inv));
    if (regras.some(([, inv]) => inv)) return;

    const id = form.editId.value;
    const btn = $('btn-salvar');
    RH.busy(btn, true);
    try {
      if (id) await API.beneficios.atualizar(id, dados);
      else await API.beneficios.criar(dados);
      modal.hide();
      RH.success(id ? 'Benefício atualizado.' : 'Benefício concedido.');
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
    const b = beneficios.find((x) => String(x.id) === btn.dataset.id);
    if (!b) return;
    if (btn.dataset.action === 'editar') abrir(b);
    if (btn.dataset.action === 'excluir') {
      RH.confirm({
        title: 'Excluir benefício',
        message: `Excluir <strong>${RH.escapeHtml(b.tipo)}</strong> de <strong>${RH.escapeHtml(funcDe(b)?.nome || 'funcionário')}</strong>?`,
        onConfirm: () => API.beneficios.deletar(b.id),
      }).then((ok) => {
        if (!ok) return;
        beneficios = beneficios.filter((x) => x.id !== b.id);
        render();
        RH.success('Benefício excluído.');
      });
    }
  });

  const refiltrar = () => { pagina = 1; render(); };
  $('f-busca').addEventListener('input', RH.debounce(refiltrar, 200));
  ['f-tipo', 'f-situacao'].forEach((id) => $(id).addEventListener('change', refiltrar));
  $('filters').addEventListener('submit', (e) => e.preventDefault());
  $('filters').addEventListener('reset', () => setTimeout(refiltrar));

  carregar();
});
