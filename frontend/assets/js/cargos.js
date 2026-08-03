const STORAGE_KEY = 'cargosData';
const PAGE_SIZE = 6;

// Mesmos departamentos usados nas demais telas do sistema
const DEPARTAMENTOS = ['RH', 'TI', 'Marketing', 'Financeiro'];

const SEED_CARGOS = [
  {
    id: 1, codigo: 'RH-001', nome: 'Analista de RH', departamento: 'RH',
    descricao: 'Responsável por recrutamento, seleção e rotinas administrativas de pessoal.',
    requisitos: 'Ensino superior em Psicologia, Administração ou áreas correlatas.',
    escolaridade: 'Ensino Superior', salarioInicial: 3200, salarioMaximo: 4800,
    cargaHoraria: 40, tipoJornada: 'Híbrido', nivel: 'Pleno', status: 'ATIVO',
    dataCriacao: '2023-02-10', ultimaAtualizacao: '2024-05-02',
  },
  {
    id: 2, codigo: 'TI-010', nome: 'Desenvolvedor Front-end', departamento: 'TI',
    descricao: 'Desenvolve e mantém interfaces web utilizando frameworks modernos.',
    requisitos: 'Experiência com HTML, CSS, JavaScript e frameworks como React ou Vue.',
    escolaridade: 'Ensino Superior', salarioInicial: 5500, salarioMaximo: 8200,
    cargaHoraria: 40, tipoJornada: 'Remoto', nivel: 'Sênior', status: 'ATIVO',
    dataCriacao: '2022-11-20', ultimaAtualizacao: '2024-06-18',
  },
  {
    id: 3, codigo: 'MKT-004', nome: 'Analista de Marketing', departamento: 'Marketing',
    descricao: 'Planeja e executa campanhas de marketing digital e institucional.',
    requisitos: 'Conhecimento em marketing digital, redes sociais e ferramentas de análise.',
    escolaridade: 'Ensino Superior', salarioInicial: 3000, salarioMaximo: 4500,
    cargaHoraria: 40, tipoJornada: 'Presencial', nivel: 'Júnior', status: 'ATIVO',
    dataCriacao: '2023-07-01', ultimaAtualizacao: '2023-07-01',
  },
  {
    id: 4, codigo: 'FIN-002', nome: 'Analista Financeiro', departamento: 'Financeiro',
    descricao: 'Controla contas a pagar/receber e elabora relatórios financeiros.',
    requisitos: 'Ensino superior em Ciências Contábeis, Economia ou Administração.',
    escolaridade: 'Ensino Superior', salarioInicial: 3800, salarioMaximo: 5600,
    cargaHoraria: 40, tipoJornada: 'Presencial', nivel: 'Pleno', status: 'ATIVO',
    dataCriacao: '2022-09-15', ultimaAtualizacao: '2024-01-10',
  },
  {
    id: 5, codigo: 'TI-021', nome: 'Coordenador de TI', departamento: 'TI',
    descricao: 'Coordena a equipe de tecnologia e a infraestrutura de sistemas.',
    requisitos: 'Experiência prévia em liderança de equipes técnicas.',
    escolaridade: 'Pós-Graduação', salarioInicial: 9000, salarioMaximo: 13000,
    cargaHoraria: 40, tipoJornada: 'Híbrido', nivel: 'Coordenador', status: 'ATIVO',
    dataCriacao: '2021-04-12', ultimaAtualizacao: '2024-03-22',
  },
  {
    id: 6, codigo: 'RH-005', nome: 'Gerente de RH', departamento: 'RH',
    descricao: 'Gerencia as políticas e a equipe de Recursos Humanos da empresa.',
    requisitos: 'Ensino superior completo e vivência sólida em gestão de pessoas.',
    escolaridade: 'Pós-Graduação', salarioInicial: 11000, salarioMaximo: 16000,
    cargaHoraria: 40, tipoJornada: 'Presencial', nivel: 'Gerente', status: 'ATIVO',
    dataCriacao: '2020-01-05', ultimaAtualizacao: '2023-12-01',
  },
  {
    id: 7, codigo: 'TI-003', nome: 'Estagiário de Suporte', departamento: 'TI',
    descricao: 'Auxilia no suporte técnico e manutenção de equipamentos.',
    requisitos: 'Cursando Ensino Superior ou Técnico em áreas de TI.',
    escolaridade: 'Técnico', salarioInicial: 1400, salarioMaximo: 1800,
    cargaHoraria: 30, tipoJornada: 'Presencial', nivel: 'Júnior', status: 'INATIVO',
    dataCriacao: '2023-03-01', ultimaAtualizacao: '2023-09-15',
  },
  {
    id: 8, codigo: 'FIN-007', nome: 'Diretor Financeiro', departamento: 'Financeiro',
    descricao: 'Define a estratégia financeira e supervisiona os resultados da empresa.',
    requisitos: 'Ampla experiência executiva em finanças corporativas.',
    escolaridade: 'MBA', salarioInicial: 18000, salarioMaximo: 26000,
    cargaHoraria: 44, tipoJornada: 'Presencial', nivel: 'Diretor', status: 'ATIVO',
    dataCriacao: '2019-06-01', ultimaAtualizacao: '2024-02-14',
  },
];

const NIVEL_ORDEM = ['Júnior', 'Pleno', 'Sênior', 'Especialista', 'Coordenador', 'Gerente', 'Diretor'];

let cargos = [];
let paginaAtual = 1;
let deleteTargetId = null;
let editFromView = false;

document.addEventListener('DOMContentLoaded', () => {
  cargos = loadCargos();

  const modalCargo = new bootstrap.Modal(document.getElementById('modal-cargo'));
  const modalVisualizar = new bootstrap.Modal(document.getElementById('modal-visualizar'));
  const modalDelete = new bootstrap.Modal(document.getElementById('modal-delete'));

  const form = document.getElementById('form-cargo');
  const modalCargoTitle = document.getElementById('modal-cargo-title');
  const formErro = document.getElementById('form-erro');
  const btnSalvar = document.getElementById('btn-salvar-cargo');

  popularSelectDepartamentos();
  renderAll();

  /* ---------- Abrir modal para novo cargo ---------- */
  document.getElementById('btn-novo-cargo').addEventListener('click', () => {
    resetForm();
    modalCargoTitle.textContent = 'Novo Cargo';
    btnSalvar.textContent = 'Salvar';
    modalCargo.show();
  });

  function resetForm() {
    form.reset();
    form.classList.remove('was-validated');
    form.id.value = '';
    form.status.value = 'ATIVO';
    hideFormErro();
    ['input-nome', 'input-codigo', 'input-departamento', 'input-nivel', 'input-cargaHoraria',
      'input-salarioInicial', 'input-salarioMaximo', 'input-tipoJornada'].forEach((id) => {
      document.getElementById(id).classList.remove('is-invalid');
    });
  }

  function hideFormErro() {
    formErro.hidden = true;
    formErro.textContent = '';
  }

  function mostrarFormErro(msg) {
    formErro.textContent = msg;
    formErro.hidden = false;
  }

  /* ---------- Criar / editar ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideFormErro();

    const dados = {
      nome: form.nome.value.trim(),
      codigo: form.codigo.value.trim().toUpperCase(),
      departamento: form.departamento.value,
      descricao: form.descricao.value.trim(),
      requisitos: form.requisitos.value.trim(),
      escolaridade: form.escolaridade.value,
      salarioInicial: parseFloat(form.salarioInicial.value),
      salarioMaximo: parseFloat(form.salarioMaximo.value),
      cargaHoraria: parseInt(form.cargaHoraria.value, 10),
      tipoJornada: form.tipoJornada.value,
      nivel: form.nivel.value,
      status: form.status.value || 'ATIVO',
    };

    let valido = true;
    const marcar = (id, ok) => {
      const el = document.getElementById(id);
      el.classList.toggle('is-invalid', !ok);
      if (!ok) valido = false;
    };

    marcar('input-nome', !!dados.nome);
    marcar('input-codigo', !!dados.codigo);
    marcar('input-departamento', !!dados.departamento);
    marcar('input-nivel', !!dados.nivel);
    marcar('input-tipoJornada', !!dados.tipoJornada);
    marcar('input-cargaHoraria', Number.isFinite(dados.cargaHoraria) && dados.cargaHoraria > 0);
    marcar('input-salarioInicial', Number.isFinite(dados.salarioInicial) && dados.salarioInicial >= 0);
    marcar('input-salarioMaximo', Number.isFinite(dados.salarioMaximo) && dados.salarioMaximo >= 0);

    if (valido && dados.salarioMaximo < dados.salarioInicial) {
      marcar('input-salarioMaximo', false);
      valido = false;
    }

    const id = form.id.value ? Number(form.id.value) : null;

    // código único (ignorando o próprio registro em edição)
    const codigoDuplicado = cargos.some((c) => c.codigo === dados.codigo && c.id !== id);
    if (codigoDuplicado) {
      marcar('input-codigo', false);
      mostrarFormErro(`Já existe um cargo com o código "${dados.codigo}".`);
      valido = false;
    }

    if (!valido) {
      form.classList.add('was-validated');
      return;
    }

    const agora = new Date().toISOString().slice(0, 10);

    if (id) {
      const idx = cargos.findIndex((c) => c.id === id);
      if (idx >= 0) {
        cargos[idx] = { ...cargos[idx], ...dados, ultimaAtualizacao: agora };
      }
      mostrarAlerta('success', `Cargo "${dados.nome}" atualizado com sucesso.`);
    } else {
      const novoId = cargos.length ? Math.max(...cargos.map((c) => c.id)) + 1 : 1;
      cargos.push({ id: novoId, ...dados, dataCriacao: agora, ultimaAtualizacao: agora });
      mostrarAlerta('success', `Cargo "${dados.nome}" cadastrado com sucesso.`);
    }

    persistCargos();
    modalCargo.hide();
    resetForm();
    paginaAtual = 1;
    renderAll();
  });

  /* ---------- Ações da tabela (visualizar / editar / excluir) ---------- */
  document.getElementById('table-cargos').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const cargo = cargos.find((c) => c.id === id);
    if (!cargo) return;

    if (btn.dataset.action === 'visualizar') {
      preencherVisualizacao(cargo);
      modalVisualizar.show();
    }

    if (btn.dataset.action === 'editar') {
      preencherFormulario(cargo);
      modalCargoTitle.textContent = 'Editar Cargo';
      btnSalvar.textContent = 'Salvar alterações';
      modalCargo.show();
    }

    if (btn.dataset.action === 'deletar') {
      deleteTargetId = cargo.id;
      document.getElementById('modal-delete-name').textContent = cargo.nome;
      modalDelete.show();
    }
  });

  document.getElementById('btn-editar-do-view').addEventListener('click', () => {
    const cargo = cargos.find((c) => c.id === editFromView);
    modalVisualizar.hide();
    if (!cargo) return;
    preencherFormulario(cargo);
    modalCargoTitle.textContent = 'Editar Cargo';
    btnSalvar.textContent = 'Salvar alterações';
    modalCargo.show();
  });

  function preencherFormulario(cargo) {
    resetForm();
    form.id.value = cargo.id;
    form.nome.value = cargo.nome || '';
    form.codigo.value = cargo.codigo || '';
    form.departamento.value = cargo.departamento || '';
    form.descricao.value = cargo.descricao || '';
    form.requisitos.value = cargo.requisitos || '';
    form.escolaridade.value = cargo.escolaridade || '';
    form.salarioInicial.value = cargo.salarioInicial ?? '';
    form.salarioMaximo.value = cargo.salarioMaximo ?? '';
    form.cargaHoraria.value = cargo.cargaHoraria ?? '';
    form.tipoJornada.value = cargo.tipoJornada || '';
    form.nivel.value = cargo.nivel || '';
    form.status.value = cargo.status || 'ATIVO';
  }

  function preencherVisualizacao(cargo) {
    editFromView = cargo.id;
    document.getElementById('view-nome').textContent = cargo.nome;
    document.getElementById('view-codigo').textContent = cargo.codigo;
    document.getElementById('view-departamento').textContent = cargo.departamento || '—';
    document.getElementById('view-nivel').textContent = cargo.nivel || '—';
    document.getElementById('view-status').innerHTML = statusBadge(cargo.status);
    document.getElementById('view-salario').textContent = formatarFaixaSalarial(cargo);
    document.getElementById('view-cargaHoraria').textContent = cargo.cargaHoraria ? `${cargo.cargaHoraria}h semanais` : '—';
    document.getElementById('view-tipoJornada').textContent = cargo.tipoJornada || '—';
    document.getElementById('view-escolaridade').textContent = cargo.escolaridade || '—';
    document.getElementById('view-criado').textContent = formatarData(cargo.dataCriacao);
    document.getElementById('view-atualizado').textContent = formatarData(cargo.ultimaAtualizacao);
    document.getElementById('view-descricao').textContent = cargo.descricao || 'Sem descrição cadastrada.';
    document.getElementById('view-requisitos').textContent = cargo.requisitos || 'Sem requisitos cadastrados.';
  }

  /* ---------- Excluir ---------- */
  document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (deleteTargetId == null) return;
    const cargo = cargos.find((c) => c.id === deleteTargetId);
    cargos = cargos.filter((c) => c.id !== deleteTargetId);
    persistCargos();
    modalDelete.hide();
    deleteTargetId = null;
    mostrarAlerta('success', `Cargo "${cargo?.nome || ''}" excluído com sucesso.`);
    if (paginaAtual > 1 && (paginaAtual - 1) * PAGE_SIZE >= cargosFiltrados().length) {
      paginaAtual -= 1;
    }
    renderAll();
  });

  /* ---------- Filtros ---------- */
  const filtersForm = document.getElementById('filters');
  filtersForm.addEventListener('submit', (e) => e.preventDefault());

  document.getElementById('filter-nome').addEventListener('input', debounce(() => {
    paginaAtual = 1;
    renderAll();
  }, 250));

  ['filter-departamento', 'filter-status'].forEach((id) => {
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

  /* ---------- Funções auxiliares ---------- */
  function popularSelectDepartamentos() {
    const selects = [document.getElementById('filter-departamento'), document.getElementById('input-departamento')];
    selects.forEach((select) => {
      DEPARTAMENTOS.forEach((dep) => {
        const opt = document.createElement('option');
        opt.value = dep;
        opt.textContent = dep;
        select.appendChild(opt);
      });
    });
  }

  function cargosFiltrados() {
    const nome = document.getElementById('filter-nome').value.trim().toLowerCase();
    const dep = document.getElementById('filter-departamento').value;
    const status = document.getElementById('filter-status').value;

    return cargos.filter((c) =>
      (!nome || (c.nome || '').toLowerCase().includes(nome)) &&
      (!dep || c.departamento === dep) &&
      (!status || c.status === status)
    );
  }

  function renderAll() {
    const lista = cargosFiltrados();
    const totalPaginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    renderSummary(lista);
    renderTable(lista);
    renderPagination(lista.length, totalPaginas);
  }

  function renderSummary(lista) {
    const summary = document.getElementById('results-summary');
    summary.textContent = lista.length === cargos.length
      ? `${cargos.length} cargo${cargos.length === 1 ? '' : 's'} cadastrado${cargos.length === 1 ? '' : 's'}`
      : `${lista.length} de ${cargos.length} cargos`;
  }

  function renderTable(lista) {
    const tbody = document.querySelector('#table-cargos tbody');
    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    const pagina = lista.slice(inicio, inicio + PAGE_SIZE);

    if (!pagina.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <div class="empty-icon">🗂️</div>
              <strong>Nenhum cargo encontrado</strong>
              <span>Ajuste os filtros ou cadastre um novo cargo.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pagina.map((c) => `
      <tr>
        <td class="cargo-code">${escapeHtml(c.codigo)}</td>
        <td class="cargo-name">${escapeHtml(c.nome)}</td>
        <td>${escapeHtml(c.departamento)}</td>
        <td><span class="level-badge">${escapeHtml(c.nivel)}</span></td>
        <td class="salario-range">${formatarFaixaSalarial(c)}</td>
        <td>${statusBadge(c.status)}</td>
        <td class="text-end actions">
          <button class="btn btn-sm btn-outline-secondary btn-icon-only" data-action="visualizar" data-id="${c.id}" title="Visualizar">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary btn-icon-only" data-action="editar" data-id="${c.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-only" data-action="deletar" data-id="${c.id}" title="Excluir">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderPagination(total, totalPaginas) {
    const nav = document.getElementById('pagination');
    const info = document.getElementById('pagination-info');

    if (!total) {
      nav.innerHTML = '';
      info.textContent = '';
      return;
    }

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
    if (tipo === 'success') {
      setTimeout(() => el.remove(), 4000);
    }
  }
});

/* ---------- Persistência ---------- */
function loadCargos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Não foi possível ler cargosData do localStorage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CARGOS));
  return SEED_CARGOS.slice();
}

function persistCargos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cargos));
  } catch (e) {
    console.error('Erro ao salvar cargos no localStorage', e);
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

function statusBadge(status) {
  const isAtivo = (status || '').toString().toUpperCase() === 'ATIVO';
  const className = isAtivo ? 'status-ativo' : 'status-inativo';
  const label = isAtivo ? 'Ativo' : 'Inativo';
  return `<span class="status-badge ${className}">${label}</span>`;
}

function formatarMoeda(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '—';
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

function formatarFaixaSalarial(cargo) {
  return `${formatarMoeda(cargo.salarioInicial)} – ${formatarMoeda(cargo.salarioMaximo)}`;
}

function formatarData(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}