const STORAGE_KEY = 'beneficiosData';
const PAGE_SIZE = 6;
const DEPS = ['RH', 'TI', 'Marketing', 'Financeiro'];
const TIPOS = ['Vale-Transporte', 'Vale-Refeição', 'Vale-Alimentação', 'Plano de Saúde', 'Plano Odontológico', 'Seguro de Vida', 'Convênio Farmácia', 'Auxílio Creche', 'Outros'];
const SITUACAO = { ATIVO: { className: 'status-ativo', label: 'Ativo' }, SUSPENSO: { className: 'status-suspenso', label: 'Suspenso' }, ENCERRADO: { className: 'status-encerrado', label: 'Encerrado' } };
const COLAB_FALLBACK = [
  { matricula: '1001', nome: 'Ana Silva', departamento: 'RH', cargo: 'Analista' },
  { matricula: '1002', nome: 'Bruno Costa', departamento: 'TI', cargo: 'Desenvolvedor' },
  { matricula: '1003', nome: 'Carla Souza', departamento: 'Marketing', cargo: 'Designer' },
];

function getColaboradores() {
  try {
    const list = JSON.parse(localStorage.getItem('funcionariosData') || 'null');
    if (Array.isArray(list) && list.length) {
      return list.map((f, i) => ({
        matricula: f.matricula || String(f.id ?? i + 1),
        nome: f.nome || 'Sem nome',
        departamento: f.departamento || '—',
        cargo: f.cargo || '—',
      }));
    }
  } catch { /* noop */ }
  return COLAB_FALLBACK;
}

function loadBeneficios() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(data)) return data;
  } catch { /* noop */ }
  const seed = seedBeneficios(getColaboradores());
  RH.saveStorage(STORAGE_KEY, seed);
  return seed;
}

function seedBeneficios(cols) {
  const base = [
    ['Vale-Refeição', 'Alelo', 660], ['Plano de Saúde', 'Unimed', 420], ['Vale-Transporte', 'Cittati', 220],
    ['Seguro de Vida', 'Porto Seguro', 45], ['Vale-Alimentação', 'Sodexo', 780],
  ];
  return base.map(([tipo, operadora, valorMensal], i) => {
    const col = cols[i % cols.length];
    return { id: i + 1, colaboradorKey: col.matricula, colaborador: col.nome, matricula: col.matricula, departamento: col.departamento, cargo: col.cargo, tipo, operadora, valorMensal, percentualDesconto: 0, dataInicio: '2023-01-01', dataTermino: '', situacao: 'ATIVO', descricao: '', observacoes: '', dataCadastro: '2023-01-01', ultimaAtualizacao: '2023-01-01' };
  });
}

let colaboradores = getColaboradores();
let beneficios = loadBeneficios();
let pagina = 1, deleteId = null, viewId = null, sortField = 'colaborador', sortDir = 'asc';

document.addEventListener('DOMContentLoaded', () => {
  const modal = new bootstrap.Modal(document.getElementById('modal-beneficio'));
  const modalView = new bootstrap.Modal(document.getElementById('modal-visualizar'));
  const modalDel = new bootstrap.Modal(document.getElementById('modal-delete'));
  const form = document.getElementById('form-beneficio');
  const title = document.getElementById('modal-beneficio-title');
  const btnSave = document.getElementById('btn-salvar-beneficio');
  const errEl = document.getElementById('form-erro');

  DEPS.forEach((d) => RH.appendSelect('filter-departamento', [d]));
  TIPOS.forEach((t) => RH.appendSelect('filter-tipo', [t]));
  const selCol = document.getElementById('input-colaborador');
  selCol.innerHTML = '<option value="">Selecione</option>';
  colaboradores.forEach((c) => {
    const o = document.createElement('option');
    o.value = c.matricula; o.textContent = `${c.nome} (${c.matricula})`;
    selCol.appendChild(o);
  });

  render();

  document.getElementById('input-colaborador').onchange = (e) => {
    const col = colaboradores.find((c) => c.matricula === e.target.value);
    document.getElementById('input-matricula').value = col?.matricula || '';
    document.getElementById('input-departamento').value = col?.departamento || '';
    document.getElementById('input-cargo').value = col?.cargo || '';
  };

  document.getElementById('btn-novo-beneficio').onclick = () => { resetForm(); title.textContent = 'Novo Benefício'; btnSave.textContent = 'Salvar'; modal.show(); };
  document.getElementById('filters').onsubmit = (e) => e.preventDefault();
  document.getElementById('filter-busca').oninput = RH.debounce(() => { pagina = 1; render(); });
  ['filter-departamento', 'filter-tipo', 'filter-situacao'].forEach((id) => document.getElementById(id).onchange = () => { pagina = 1; render(); });
  document.getElementById('btn-clear').onclick = () => { document.getElementById('filters').reset(); pagina = 1; render(); };

  document.querySelectorAll('#table-beneficios thead th.sortable').forEach((th) => {
    th.onclick = () => {
      const f = th.dataset.sort;
      sortDir = sortField === f ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
      sortField = f;
      render();
    };
  });

  document.getElementById('table-beneficios').onclick = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const b = beneficios.find((x) => x.id === Number(btn.dataset.id));
    if (!b) return;
    if (btn.dataset.action === 'visualizar') { fillView(b); modalView.show(); }
    if (btn.dataset.action === 'editar') { fillForm(b); title.textContent = 'Editar Benefício'; btnSave.textContent = 'Salvar alterações'; modal.show(); }
    if (btn.dataset.action === 'deletar') { deleteId = b.id; document.getElementById('modal-delete-name').textContent = `${b.tipo} — ${b.colaborador}`; modalDel.show(); }
  };

  document.getElementById('btn-editar-do-view').onclick = () => {
    const b = beneficios.find((x) => x.id === viewId);
    modalView.hide();
    if (!b) return;
    fillForm(b); title.textContent = 'Editar Benefício'; btnSave.textContent = 'Salvar alterações'; modal.show();
  };

  document.getElementById('btn-confirm-delete').onclick = () => {
    if (deleteId == null) return;
    const b = beneficios.find((x) => x.id === deleteId);
    beneficios = beneficios.filter((x) => x.id !== deleteId);
    RH.saveStorage(STORAGE_KEY, beneficios);
    modalDel.hide(); deleteId = null;
    RH.alert('success', `Benefício removido de ${b?.colaborador || ''}.`);
    if (pagina > 1 && (pagina - 1) * PAGE_SIZE >= filtrados().length) pagina -= 1;
    render();
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    errEl.hidden = true;
    const col = colaboradores.find((c) => c.matricula === form.colaboradorKey.value);
    const dados = {
      colaboradorKey: form.colaboradorKey.value, colaborador: col?.nome || '', matricula: col?.matricula || '',
      departamento: col?.departamento || '', cargo: col?.cargo || '', tipo: form.tipo.value,
      operadora: form.operadora.value.trim(), descricao: form.descricao.value.trim(),
      valorMensal: parseFloat(form.valorMensal.value), percentualDesconto: parseFloat(form.percentualDesconto.value) || 0,
      dataInicio: form.dataInicio.value, dataTermino: form.dataTermino.value || '',
      situacao: form.situacao.value || 'ATIVO', observacoes: form.observacoes.value.trim(),
    };
    const mark = (id, cond) => { document.getElementById(id).classList.toggle('is-invalid', cond); return cond; };
    let bad = mark('input-colaborador', !dados.colaboradorKey) || mark('input-tipo', !dados.tipo)
      || mark('input-valorMensal', !(dados.valorMensal >= 0)) || mark('input-dataInicio', !dados.dataInicio)
      || mark('input-dataTermino', !!(dados.dataTermino && dados.dataTermino < dados.dataInicio));
    if (bad) { form.classList.add('was-validated'); errEl.textContent = 'Revise os campos destacados.'; errEl.hidden = false; return; }

    const hoje = new Date().toISOString().slice(0, 10);
    const id = form.id.value ? Number(form.id.value) : null;
    if (id) {
      const i = beneficios.findIndex((b) => b.id === id);
      if (i >= 0) beneficios[i] = { ...beneficios[i], ...dados, ultimaAtualizacao: hoje };
      RH.alert('success', `Benefício de ${dados.colaborador} atualizado.`);
    } else {
      beneficios.push({ id: beneficios.length ? Math.max(...beneficios.map((b) => b.id)) + 1 : 1, ...dados, dataCadastro: hoje, ultimaAtualizacao: hoje });
      RH.alert('success', `Benefício cadastrado para ${dados.colaborador}.`);
    }
    RH.saveStorage(STORAGE_KEY, beneficios);
    modal.hide(); resetForm(); pagina = 1; render();
  };

  function resetForm() {
    form.reset(); form.classList.remove('was-validated'); form.id.value = ''; form.situacao.value = 'ATIVO';
    ['input-matricula', 'input-departamento', 'input-cargo'].forEach((id) => { document.getElementById(id).value = ''; });
    errEl.hidden = true;
    ['input-colaborador', 'input-tipo', 'input-valorMensal', 'input-dataInicio', 'input-dataTermino'].forEach((id) => document.getElementById(id).classList.remove('is-invalid'));
  }

  function fillForm(b) {
    resetForm(); form.id.value = b.id; form.colaboradorKey.value = b.colaboradorKey;
    document.getElementById('input-matricula').value = b.matricula || '';
    document.getElementById('input-departamento').value = b.departamento || '';
    document.getElementById('input-cargo').value = b.cargo || '';
    ['tipo', 'operadora', 'descricao', 'valorMensal', 'percentualDesconto', 'dataInicio', 'dataTermino', 'situacao', 'observacoes']
      .forEach((k) => { if (form[k]) form[k].value = b[k] ?? ''; });
  }

  function fillView(b) {
    viewId = b.id;
    document.getElementById('view-tipo').textContent = b.tipo;
    document.getElementById('view-colaborador').textContent = `${b.colaborador} — ${b.cargo || ''}`;
    document.getElementById('view-matricula').textContent = b.matricula || '—';
    document.getElementById('view-departamento').textContent = b.departamento || '—';
    document.getElementById('view-cargo').textContent = b.cargo || '—';
    document.getElementById('view-situacao').innerHTML = RH.statusBadge(b.situacao, SITUACAO);
    document.getElementById('view-operadora').textContent = b.operadora || '—';
    document.getElementById('view-valor').textContent = RH.formatCurrency(b.valorMensal);
    document.getElementById('view-desconto').textContent = b.percentualDesconto ? `${b.percentualDesconto}%` : 'Não aplicável';
    document.getElementById('view-dataInicio').textContent = RH.formatDate(b.dataInicio);
    document.getElementById('view-dataTermino').textContent = b.dataTermino ? RH.formatDate(b.dataTermino) : 'Indeterminado';
    document.getElementById('view-criado').textContent = RH.formatDate(b.dataCadastro);
    document.getElementById('view-atualizado').textContent = RH.formatDate(b.ultimaAtualizacao);
    document.getElementById('view-descricao').textContent = b.descricao || 'Sem descrição cadastrada.';
    document.getElementById('view-observacoes').textContent = b.observacoes || 'Sem observações.';
  }

  function filtrados() {
    const busca = document.getElementById('filter-busca').value.trim().toLowerCase();
    const dep = document.getElementById('filter-departamento').value;
    const tipo = document.getElementById('filter-tipo').value;
    const situacao = document.getElementById('filter-situacao').value;
    return beneficios.filter((b) =>
      (!busca || [b.colaborador, b.matricula, b.tipo].some((v) => (v || '').toLowerCase().includes(busca))) &&
      (!dep || b.departamento === dep) && (!tipo || b.tipo === tipo) && (!situacao || b.situacao === situacao)
    ).sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'colaborador') { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
      return va < vb ? (sortDir === 'asc' ? -1 : 1) : va > vb ? (sortDir === 'asc' ? 1 : -1) : 0;
    });
  }

  function render() {
    const lista = filtrados();
    const totalPages = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
    if (pagina > totalPages) pagina = totalPages;
    RH.renderPagination({ navId: 'pagination', infoId: 'pagination-info', page: pagina, pageSize: PAGE_SIZE, total: lista.length, onPage: (p) => { pagina = p; render(); } });

    document.getElementById('results-summary').textContent = lista.length === beneficios.length
      ? `${beneficios.length} benefício${beneficios.length === 1 ? '' : 's'} concedido${beneficios.length === 1 ? '' : 's'}`
      : `${lista.length} de ${beneficios.length} benefícios`;

    const slice = lista.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);
    const tbody = document.querySelector('#table-beneficios tbody');
    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🎁</div><strong>Nenhum benefício encontrado</strong><span>Ajuste os filtros ou cadastre um novo benefício.</span></div></td></tr>`;
      return;
    }
    tbody.innerHTML = slice.map((b) => `<tr>
      <td class="matricula-code">${RH.escapeHtml(b.matricula)}</td>
      <td><span class="colaborador-name">${RH.escapeHtml(b.colaborador)}</span><span class="colaborador-cargo">${RH.escapeHtml(b.cargo || '')}</span></td>
      <td>${RH.escapeHtml(b.departamento)}</td><td><span class="type-badge">${RH.escapeHtml(b.tipo)}</span></td>
      <td class="valor-mensal">${RH.formatCurrency(b.valorMensal)}</td>
      <td>${RH.statusBadge(b.situacao, SITUACAO)}</td><td>${RH.formatDate(b.dataInicio)}</td>
      <td class="text-end actions">
        <button class="btn btn-sm btn-outline-secondary btn-icon-only" data-action="visualizar" data-id="${b.id}"><i class="bi bi-eye"></i></button>
        <button class="btn btn-sm btn-outline-secondary btn-icon-only" data-action="editar" data-id="${b.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger btn-icon-only" data-action="deletar" data-id="${b.id}"><i class="bi bi-trash"></i></button>
      </td></tr>`).join('');
  }
});
