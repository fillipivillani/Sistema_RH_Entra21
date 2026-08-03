const STORAGE_KEY = 'beneficiosData';
const PAGE_SIZE = 6;

const DEPARTAMENTOS = ['RH', 'TI', 'Marketing', 'Financeiro'];

const TIPOS_BENEFICIO = [
  'Vale-Transporte', 'Vale-Refeição', 'Vale-Alimentação', 'Plano de Saúde',
  'Plano Odontológico', 'Seguro de Vida', 'Convênio Farmácia', 'Auxílio Creche', 'Outros',
];

// Colaboradores fictícios usados caso não existam funcionários cadastrados
// em localStorage.funcionariosData (tela de Funcionários do sistema).
const COLABORADORES_FALLBACK = [
  { matricula: '1001', nome: 'Ana Silva', departamento: 'RH', cargo: 'Analista' },
  { matricula: '1002', nome: 'Bruno Costa', departamento: 'TI', cargo: 'Desenvolvedor' },
  { matricula: '1003', nome: 'Carla Souza', departamento: 'Marketing', cargo: 'Designer' },
  { matricula: '1004', nome: 'Diego Almeida', departamento: 'Financeiro', cargo: 'Analista' },
  { matricula: '1005', nome: 'Elaine Ferreira', departamento: 'RH', cargo: 'Gerente' },
  { matricula: '1006', nome: 'Felipe Martins', departamento: 'TI', cargo: 'Analista' },
  { matricula: '1007', nome: 'Gabriela Lima', departamento: 'Marketing', cargo: 'Analista' },
  { matricula: '1008', nome: 'Henrique Rocha', departamento: 'Financeiro', cargo: 'Gerente' },
];

function getColaboradores() {
  try {
    const raw = localStorage.getItem('funcionariosData');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((f, i) => ({
          matricula: f.matricula || String(f.id ?? i + 1),
          nome: f.nome || 'Sem nome',
          departamento: f.departamento || '—',
          cargo: f.cargo || '—',
        }));
      }
    }
  } catch (e) {
    console.warn('Não foi possível ler funcionariosData; usando lista fictícia.', e);
  }
  return COLABORADORES_FALLBACK;
}

function seedBeneficios(colaboradores) {
  const porMatricula = (m) => colaboradores.find((c) => c.matricula === m) || colaboradores[0];
  const registros = [
    { matricula: colaboradores[0]?.matricula, tipo: 'Vale-Refeição', operadora: 'Alelo', valorMensal: 660, percentualDesconto: 0, dataInicio: '2023-02-01', dataTermino: '', situacao: 'ATIVO', descricao: 'Cartão recarregado mensalmente para refeições.', observacoes: '' },
    { matricula: colaboradores[0]?.matricula, tipo: 'Plano de Saúde', operadora: 'Unimed', valorMensal: 420, percentualDesconto: 20, dataInicio: '2022-06-15', dataTermino: '', situacao: 'ATIVO', descricao: 'Plano de saúde empresarial, coparticipação parcial.', observacoes: 'Inclui dependentes mediante desconto adicional.' },
    { matricula: colaboradores[1]?.matricula, tipo: 'Vale-Transporte', operadora: 'Cittati', valorMensal: 220, percentualDesconto: 6, dataInicio: '2021-11-20', dataTermino: '', situacao: 'ATIVO', descricao: 'Créditos de transporte público mensal.', observacoes: '' },
    { matricula: colaboradores[1]?.matricula, tipo: 'Seguro de Vida', operadora: 'Porto Seguro', valorMensal: 45, percentualDesconto: 0, dataInicio: '2021-11-20', dataTermino: '', situacao: 'ATIVO', descricao: 'Seguro de vida em grupo, cobertura básica.', observacoes: '' },
    { matricula: colaboradores[2]?.matricula, tipo: 'Vale-Alimentação', operadora: 'Sodexo', valorMensal: 780, percentualDesconto: 0, dataInicio: '2023-07-01', dataTermino: '', situacao: 'ATIVO', descricao: 'Cartão alimentação mensal.', observacoes: '' },
    { matricula: colaboradores[3]?.matricula, tipo: 'Plano Odontológico', operadora: 'OdontoPrev', valorMensal: 35, percentualDesconto: 10, dataInicio: '2022-09-10', dataTermino: '', situacao: 'SUSPENSO', descricao: 'Plano odontológico básico.', observacoes: 'Suspenso temporariamente a pedido do colaborador.' },
    { matricula: colaboradores[4]?.matricula, tipo: 'Auxílio Creche', operadora: 'Reembolso direto', valorMensal: 500, percentualDesconto: 0, dataInicio: '2020-03-01', dataTermino: '', situacao: 'ATIVO', descricao: 'Reembolso mensal de despesas com creche.', observacoes: '' },
    { matricula: colaboradores[5]?.matricula, tipo: 'Convênio Farmácia', operadora: 'Rede Pague Menos', valorMensal: 60, percentualDesconto: 0, dataInicio: '2023-01-15', dataTermino: '2024-01-15', situacao: 'ENCERRADO', descricao: 'Desconto em medicamentos na rede conveniada.', observacoes: 'Encerrado ao final da vigência contratual.' },
    { matricula: colaboradores[6]?.matricula, tipo: 'Vale-Refeição', operadora: 'VR Benefícios', valorMensal: 700, percentualDesconto: 0, dataInicio: '2023-04-01', dataTermino: '', situacao: 'ATIVO', descricao: 'Cartão recarregado mensalmente para refeições.', observacoes: '' },
    { matricula: colaboradores[7]?.matricula, tipo: 'Plano de Saúde', operadora: 'Bradesco Saúde', valorMensal: 510, percentualDesconto: 15, dataInicio: '2019-06-01', dataTermino: '', situacao: 'ATIVO', descricao: 'Plano de saúde executivo.', observacoes: '' },
    { matricula: colaboradores[2]?.matricula, tipo: 'Vale-Transporte', operadora: 'Cittati', valorMensal: 220, percentualDesconto: 6, dataInicio: '2023-07-01', dataTermino: '', situacao: 'ATIVO', descricao: 'Créditos de transporte público mensal.', observacoes: '' },
  ];

  return registros.filter((r) => r.matricula).map((r, i) => {
    const col = porMatricula(r.matricula);
    return {
      id: i + 1,
      colaboradorKey: col.matricula,
      colaborador: col.nome,
      matricula: col.matricula,
      departamento: col.departamento,
      cargo: col.cargo,
      ...r,
      dataCadastro: r.dataInicio,
      ultimaAtualizacao: r.dataInicio,
    };
  });
}

let colaboradores = [];
let beneficios = [];
let paginaAtual = 1;
let deleteTargetId = null;
let editFromView = null;
let sortField = 'colaborador';
let sortDir = 'asc';

document.addEventListener('DOMContentLoaded', () => {
  colaboradores = getColaboradores();
  beneficios = loadBeneficios();

  const modalBeneficio = new bootstrap.Modal(document.getElementById('modal-beneficio'));
  const modalVisualizar = new bootstrap.Modal(document.getElementById('modal-visualizar'));
  const modalDelete = new bootstrap.Modal(document.getElementById('modal-delete'));

  const form = document.getElementById('form-beneficio');
  const modalTitle = document.getElementById('modal-beneficio-title');
  const formErro = document.getElementById('form-erro');
  const btnSalvar = document.getElementById('btn-salvar-beneficio');

  popularSelects();
  renderAll();

  /* ---------- Auto-preenchimento ao escolher colaborador ---------- */
  document.getElementById('input-colaborador').addEventListener('change', (e) => {
    const col = colaboradores.find((c) => c.matricula === e.target.value);
    document.getElementById('input-matricula').value = col?.matricula || '';
    document.getElementById('input-departamento').value = col?.departamento || '';
    document.getElementById('input-cargo').value = col?.cargo || '';
  });

  /* ---------- Novo benefício ---------- */
  document.getElementById('btn-novo-beneficio').addEventListener('click', () => {
    resetForm();
    modalTitle.textContent = 'Novo Benefício';
    btnSalvar.textContent = 'Salvar';
    modalBeneficio.show();
  });

  function resetForm() {
    form.reset();
    form.classList.remove('was-validated');
    form.id.value = '';
    form.situacao.value = 'ATIVO';
    document.getElementById('input-matricula').value = '';
    document.getElementById('input-departamento').value = '';
    document.getElementById('input-cargo').value = '';
    hideFormErro();
    ['input-colaborador', 'input-tipo', 'input-valorMensal', 'input-dataInicio', 'input-dataTermino'].forEach((id) => {
      document.getElementById(id).classList.remove('is-invalid');
    });
  }

  function hideFormErro() { formErro.hidden = true; formErro.textContent = ''; }
  function mostrarFormErro(msg) { formErro.textContent = msg; formErro.hidden = false; }

  /* ---------- Criar / editar ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideFormErro();

    const col = colaboradores.find((c) => c.matricula === form.colaboradorKey.value);

    const dados = {
      colaboradorKey: form.colaboradorKey.value,
      colaborador: col?.nome || '',
      matricula: col?.matricula || '',
      departamento: col?.departamento || '',
      cargo: col?.cargo || '',
      tipo: form.tipo.value,
      operadora: form.operadora.value.trim(),
      descricao: form.descricao.value.trim(),
      valorMensal: parseFloat(form.valorMensal.value),
      percentualDesconto: form.percentualDesconto.value ? parseFloat(form.percentualDesconto.value) : 0,
      dataInicio: form.dataInicio.value,
      dataTermino: form.dataTermino.value || '',
      situacao: form.situacao.value || 'ATIVO',
      observacoes: form.observacoes.value.trim(),
    };

    let valido = true;
    const marcar = (id, ok) => {
      document.getElementById(id).classList.toggle('is-invalid', !ok);
      if (!ok) valido = false;
    };

    marcar('input-colaborador', !!dados.colaboradorKey);
    marcar('input-tipo', !!dados.tipo);
    marcar('input-valorMensal', Number.isFinite(dados.valorMensal) && dados.valorMensal >= 0);
    marcar('input-dataInicio', !!dados.dataInicio);

    if (dados.dataTermino && dados.dataInicio && dados.dataTermino < dados.dataInicio) {
      marcar('input-dataTermino', false);
      valido = false;
    } else {
      marcar('input-dataTermino', true);
    }

    if (!valido) {
      form.classList.add('was-validated');
      mostrarFormErro('Revise os campos destacados antes de salvar.');
      return;
    }

    const id = form.id.value ? Number(form.id.value) : null;
    const agora = new Date().toISOString().slice(0, 10);

    if (id) {
      const idx = beneficios.findIndex((b) => b.id === id);
      if (idx >= 0) {
        beneficios[idx] = { ...beneficios[idx], ...dados, ultimaAtualizacao: agora };
      }
      mostrarAlerta('success', `Benefício de ${dados.colaborador} atualizado com sucesso.`);
    } else {
      const novoId = beneficios.length ? Math.max(...beneficios.map((b) => b.id)) + 1 : 1;
      beneficios.push({ id: novoId, ...dados, dataCadastro: agora, ultimaAtualizacao: agora });
      mostrarAlerta('success', `Benefício cadastrado para ${dados.colaborador}.`);
    }

    persistBeneficios();
    modalBeneficio.hide();
    resetForm();
    paginaAtual = 1;
    renderAll();
  });

  /* ---------- Ações da tabela ---------- */
  document.getElementById('table-beneficios').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const beneficio = beneficios.find((b) => b.id === id);
    if (!beneficio) return;

    if (btn.dataset.action === 'visualizar') {
      preencherVisualizacao(beneficio);
      modalVisualizar.show();
    }
    if (btn.dataset.action === 'editar') {
      preencherFormulario(beneficio);
      modalTitle.textContent = 'Editar Benefício';
      btnSalvar.textContent = 'Salvar alterações';
      modalBeneficio.show();
    }
    if (btn.dataset.action === 'deletar') {
      deleteTargetId = beneficio.id;
      document.getElementById('modal-delete-name').textContent = `${beneficio.tipo} — ${beneficio.colaborador}`;
      modalDelete.show();
    }
  });

  document.getElementById('btn-editar-do-view').addEventListener('click', () => {
    const beneficio = beneficios.find((b) => b.id === editFromView);
    modalVisualizar.hide();
    if (!beneficio) return;
    preencherFormulario(beneficio);
    modalTitle.textContent = 'Editar Benefício';
    btnSalvar.textContent = 'Salvar alterações';
    modalBeneficio.show();
  });

  function preencherFormulario(b) {
    resetForm();
    form.id.value = b.id;
    form.colaboradorKey.value = b.colaboradorKey;
    document.getElementById('input-matricula').value = b.matricula || '';
    document.getElementById('input-departamento').value = b.departamento || '';
    document.getElementById('input-cargo').value = b.cargo || '';
    form.tipo.value = b.tipo || '';
    form.operadora.value = b.operadora || '';
    form.descricao.value = b.descricao || '';
    form.valorMensal.value = b.valorMensal ?? '';
    form.percentualDesconto.value = b.percentualDesconto ?? '';
    form.dataInicio.value = b.dataInicio || '';
    form.dataTermino.value = b.dataTermino || '';
    form.situacao.value = b.situacao || 'ATIVO';
    form.observacoes.value = b.observacoes || '';
  }

  function preencherVisualizacao(b) {
    editFromView = b.id;
    document.getElementById('view-tipo').textContent = b.tipo;
    document.getElementById('view-colaborador').textContent = `${b.colaborador} — ${b.cargo || ''}`;
    document.getElementById('view-matricula').textContent = b.matricula || '—';
    document.getElementById('view-departamento').textContent = b.departamento || '—';
    document.getElementById('view-cargo').textContent = b.cargo || '—';
    document.getElementById('view-situacao').innerHTML = statusBadge(b.situacao);
    document.getElementById('view-operadora').textContent = b.operadora || '—';
    document.getElementById('view-valor').textContent = formatarMoeda(b.valorMensal);
    document.getElementById('view-desconto').textContent = b.percentualDesconto ? `${b.percentualDesconto}%` : 'Não aplicável';
    document.getElementById('view-dataInicio').textContent = formatarData(b.dataInicio);
    document.getElementById('view-dataTermino').textContent = b.dataTermino ? formatarData(b.dataTermino) : 'Indeterminado';
    document.getElementById('view-criado').textContent = formatarData(b.dataCadastro);
    document.getElementById('view-atualizado').textContent = formatarData(b.ultimaAtualizacao);
    document.getElementById('view-descricao').textContent = b.descricao || 'Sem descrição cadastrada.';
    document.getElementById('view-observacoes').textContent = b.observacoes || 'Sem observações.';
  }

  /* ---------- Excluir ---------- */
  document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (deleteTargetId == null) return;
    const b = beneficios.find((x) => x.id === deleteTargetId);
    beneficios = beneficios.filter((x) => x.id !== deleteTargetId);
    persistBeneficios();
    modalDelete.hide();
    deleteTargetId = null;
    mostrarAlerta('success', `Benefício removido de ${b?.colaborador || ''}.`);
    if (paginaAtual > 1 && (paginaAtual - 1) * PAGE_SIZE >= beneficiosFiltrados().length) {
      paginaAtual -= 1;
    }
    renderAll();
  });

  /* ---------- Filtros ---------- */
  const filtersForm = document.getElementById('filters');
  filtersForm.addEventListener('submit', (e) => e.preventDefault());

  document.getElementById('filter-busca').addEventListener('input', debounce(() => {
    paginaAtual = 1;
    renderAll();
  }, 250));

  ['filter-departamento', 'filter-tipo', 'filter-situacao'].forEach((id) => {
    document.getElementById(id).addEventListener('change', () => {
      paginaAtual = 1;
      renderAll();
    });
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    filtersForm.reset();
    paginaAtual = 1;
    renderAll();
  });

  /* ---------- Ordenação ---------- */
  document.querySelectorAll('#table-beneficios thead th.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortDir = 'asc';
      }
      atualizarIconesOrdenacao();
      renderAll();
    });
  });

  function atualizarIconesOrdenacao() {
    document.querySelectorAll('.sort-icon').forEach((icon) => {
      const field = icon.dataset.sortIcon;
      icon.classList.toggle('active', field === sortField);
      icon.className = `bi sort-icon ${field === sortField ? 'active' : ''} ${
        field === sortField ? (sortDir === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down') : 'bi-arrow-down-up'
      }`;
    });
  }
  atualizarIconesOrdenacao();

  /* ---------- Funções auxiliares internas ---------- */
  function popularSelects() {
    const filtroDep = document.getElementById('filter-departamento');
    const filtroTipo = document.getElementById('filter-tipo');
    const selectColaborador = document.getElementById('input-colaborador');

    DEPARTAMENTOS.forEach((dep) => {
      const opt = document.createElement('option');
      opt.value = dep; opt.textContent = dep;
      filtroDep.appendChild(opt);
    });

    TIPOS_BENEFICIO.forEach((tipo) => {
      const opt = document.createElement('option');
      opt.value = tipo; opt.textContent = tipo;
      filtroTipo.appendChild(opt);
    });

    colaboradores.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.matricula;
      opt.textContent = `${c.nome} (${c.matricula})`;
      selectColaborador.appendChild(opt);
    });
  }

  function beneficiosFiltrados() {
    const busca = document.getElementById('filter-busca').value.trim().toLowerCase();
    const dep = document.getElementById('filter-departamento').value;
    const tipo = document.getElementById('filter-tipo').value;
    const situacao = document.getElementById('filter-situacao').value;

    let lista = beneficios.filter((b) =>
      (!busca ||
        (b.colaborador || '').toLowerCase().includes(busca) ||
        (b.matricula || '').toLowerCase().includes(busca) ||
        (b.tipo || '').toLowerCase().includes(busca)) &&
      (!dep || b.departamento === dep) &&
      (!tipo || b.tipo === tipo) &&
      (!situacao || b.situacao === situacao)
    );

    lista = lista.slice().sort((a, b) => {
      let va = a[sortField]; let vb = b[sortField];
      if (sortField === 'colaborador') { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return lista;
  }

  function renderAll() {
    const lista = beneficiosFiltrados();
    const totalPaginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    renderSummary(lista);
    renderTable(lista);
    renderPagination(lista.length, totalPaginas);
  }

  function renderSummary(lista) {
    const summary = document.getElementById('results-summary');
    summary.textContent = lista.length === beneficios.length
      ? `${beneficios.length} benefício${beneficios.length === 1 ? '' : 's'} concedido${beneficios.length === 1 ? '' : 's'}`
      : `${lista.length} de ${beneficios.length} benefícios`;
  }

  function renderTable(lista) {
    const tbody = document.querySelector('#table-beneficios tbody');
    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    const pagina = lista.slice(inicio, inicio + PAGE_SIZE);

    if (!pagina.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <div class="empty-icon">🎁</div>
              <strong>Nenhum benefício encontrado</strong>
              <span>Ajuste os filtros ou cadastre um novo benefício.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pagina.map((b) => `
      <tr>
        <td class="matricula-code">${escapeHtml(b.matricula)}</td>
        <td>
          <span class="colaborador-name">${escapeHtml(b.colaborador)}</span>
          <span class="colaborador-cargo">${escapeHtml(b.cargo || '')}</span>
        </td>
        <td>${escapeHtml(b.departamento)}</td>
        <td><span class="type-badge">${escapeHtml(b.tipo)}</span></td>
        <td class="valor-mensal">${formatarMoeda(b.valorMensal)}</td>
        <td>${statusBadge(b.situacao)}</td>
        <td>${formatarData(b.dataInicio)}</td>
        <td class="text-end actions">
          <button class="btn btn-sm btn-outline-secondary btn-icon-only" data-action="visualizar" data-id="${b.id}" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary btn-icon-only" data-action="editar" data-id="${b.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-only" data-action="deletar" data-id="${b.id}" title="Remover">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderPagination(total, totalPaginas) {
    const nav = document.getElementById('pagination');
    const info = document.getElementById('pagination-info');

    if (!total) { nav.innerHTML = ''; info.textContent = ''; return; }

    const inicio = (paginaAtual - 1) * PAGE_SIZE + 1;
    const fim = Math.min(paginaAtual * PAGE_SIZE, total);
    info.textContent = `Mostrando ${inicio}–${fim} de ${total}`;

    const itens = [];
    itens.push(pageItem('«', paginaAtual - 1, paginaAtual === 1));
    for (let p = 1; p <= totalPaginas; p += 1) {
      itens.push(pageItem(String(p), p, false, p === paginaAtual));
    }
    itens.push(pageItem('»', paginaAtual + 1, paginaAtual === totalPaginas));

    nav.innerHTML = itens.join('');
    nav.querySelectorAll('[data-page]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const p = Number(el.dataset.page);
        if (p < 1 || p > totalPaginas || p === paginaAtual) return;
        paginaAtual = p;
        renderAll();
      });
    });
  }

  function pageItem(label, page, disabled, active) {
    return `
      <li class="page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}">
        <a href="#" class="page-link" data-page="${page}">${label}</a>
      </li>
    `;
  }

  function mostrarAlerta(tipo, mensagem) {
    const stack = document.getElementById('alert-stack');
    const el = document.createElement('div');
    el.className = `app-alert ${tipo}`;
    const icon = tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    el.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${escapeHtml(mensagem)}</span>
      <button type="button" class="btn-close" aria-label="Fechar"></button>
    `;
    el.querySelector('.btn-close').addEventListener('click', () => el.remove());
    stack.appendChild(el);
    if (tipo === 'success') setTimeout(() => el.remove(), 4000);
  }
});

/* ---------- Persistência ---------- */
function loadBeneficios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Não foi possível ler beneficiosData do localStorage', e);
  }
  const seed = seedBeneficios(getColaboradores());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function persistBeneficios() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beneficios));
  } catch (e) {
    console.error('Erro ao salvar benefícios no localStorage', e);
  }
}

/* ---------- Utilitários ---------- */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(str) {
  return (str ?? '').toString().replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function statusBadge(situacao) {
  const key = (situacao || 'ATIVO').toString().toUpperCase();
  const map = {
    ATIVO: { className: 'status-ativo', label: 'Ativo' },
    SUSPENSO: { className: 'status-suspenso', label: 'Suspenso' },
    ENCERRADO: { className: 'status-encerrado', label: 'Encerrado' },
  };
  const meta = map[key] || map.ATIVO;
  return `<span class="status-badge ${meta.className}">${meta.label}</span>`;
}

function formatarMoeda(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '—';
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

function formatarData(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}