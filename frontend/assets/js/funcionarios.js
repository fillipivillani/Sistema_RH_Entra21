const STORAGE_KEY = 'funcionariosData';

// Dados iniciais usados apenas na primeira vez que a tela é aberta
// (nenhum funcionário salvo ainda no localStorage).
const SEED_FUNCIONARIOS = [
  { id: 1, nome: 'Ana Silva', cpf: '123.456.789-00', cargo: 'Analista', departamento: 'RH', status: 'ATIVO', admissao: '2022-03-01' },
  { id: 2, nome: 'Bruno Costa', cpf: '987.654.321-11', cargo: 'Desenvolvedor', departamento: 'TI', status: 'ATIVO', admissao: '2021-11-15' },
  { id: 3, nome: 'Carla Souza', cpf: '456.123.789-22', cargo: 'Designer', departamento: 'Marketing', status: 'INATIVO', admissao: '2020-06-20' },
];

const STATUS_META = {
  ATIVO: { label: 'Ativo', className: 'status-ativo' },
  INATIVO: { label: 'Inativo', className: 'status-inativo' },
  AFASTADO: { label: 'Afastado', className: 'status-afastado' },
  DESLIGADO: { label: 'Desligado', className: 'status-desligado' },
};

let funcionarios = [];
let deleteTargetId = null;
let deleteModal = null;

/* ---------- Utilitários ---------- */
function onlyDigits(str) {
  return (str || '').toString().replace(/\D+/g, '');
}

function escapeHtml(str) {
  return (str ?? '').toString().replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function getStatusMeta(raw) {
  const key = (raw || '').toString().trim().toUpperCase();
  return STATUS_META[key] || { label: raw || '—', className: 'status-inativo' };
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---------- Persistência ---------- */
function loadFuncionarios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Não foi possível ler funcionariosData do localStorage', e);
  }
  // primeira execução: grava os dados de exemplo para não se perderem
  // ao recarregar a página
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_FUNCIONARIOS));
  return SEED_FUNCIONARIOS.slice();
}

function persistFuncionarios() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
  } catch (e) {
    console.error('Erro ao salvar funcionários no localStorage', e);
  }
}

/* ---------- Inicialização ---------- */
document.addEventListener('DOMContentLoaded', () => {
  funcionarios = loadFuncionarios();
  deleteModal = new bootstrap.Modal(document.getElementById('modal-delete'));

  popularFiltros();
  renderTable(funcionarios);

  const filtersForm = document.getElementById('filters');

  // impede reload da página ao apertar Enter num campo de filtro
  filtersForm.addEventListener('submit', (e) => {
    e.preventDefault();
    filtrar();
  });

  // filtro reativo enquanto o usuário digita/seleciona
  ['filter-nome', 'filter-cpf'].forEach((id) => {
    document.getElementById(id).addEventListener('input', debounce(filtrar, 250));
  });
  ['filter-dep', 'filter-cargo', 'filter-status'].forEach((id) => {
    document.getElementById(id).addEventListener('change', filtrar);
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    filtersForm.reset();
    renderTable(funcionarios);
  });

  document.getElementById('table-funcionarios').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const func = funcionarios.find((f) => f.id === Number(btn.dataset.id));
    if (!func) return;

    if (btn.dataset.action === 'edit') {
      localStorage.setItem('editingFuncionario', JSON.stringify(func));
      location.href = 'funcionario-editar.html';
    }

    if (btn.dataset.action === 'delete') {
      deleteTargetId = func.id;
      document.getElementById('modal-delete-name').textContent = func.nome || 'este funcionário';
      deleteModal.show();
    }
  });

  document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (deleteTargetId == null) return;
    funcionarios = funcionarios.filter((f) => f.id !== deleteTargetId);
    persistFuncionarios();
    deleteTargetId = null;
    deleteModal.hide();
    filtrar();
  });
});

/* ---------- Renderização ---------- */
function renderTable(lista) {
  const tbody = document.querySelector('#table-funcionarios tbody');
  const summary = document.getElementById('results-summary');

  summary.textContent = lista.length === funcionarios.length
    ? `${funcionarios.length} funcionário${funcionarios.length === 1 ? '' : 's'} cadastrado${funcionarios.length === 1 ? '' : 's'}`
    : `${lista.length} de ${funcionarios.length} funcionários`;

  if (!lista.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">🗂️</div>
            <strong>Nenhum funcionário encontrado</strong>
            <span>Ajuste os filtros ou cadastre um novo funcionário.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista.map((f) => {
    const status = getStatusMeta(f.status);
    const foto = f.foto && !f.foto.includes('avatar-placeholder')
      ? f.foto
      : '../assets/images/avatar-placeholder.png';

    return `
      <tr>
        <td class="col-avatar">
          <img src="${escapeHtml(foto)}" class="avatar" alt="Foto de ${escapeHtml(f.nome)}">
        </td>
        <td class="employee-name">${escapeHtml(f.nome)}</td>
        <td>${escapeHtml(f.cpf)}</td>
        <td>${escapeHtml(f.cargo)}</td>
        <td>${escapeHtml(f.departamento)}</td>
        <td><span class="status-badge ${status.className}">${escapeHtml(status.label)}</span></td>
        <td>${formatDate(f.admissao)}</td>
        <td class="text-end actions">
          <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${f.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${f.id}">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}

function popularFiltros() {
  preencherSelect('filter-dep', [...new Set(funcionarios.map((f) => f.departamento).filter(Boolean))]);
  preencherSelect('filter-cargo', [...new Set(funcionarios.map((f) => f.cargo).filter(Boolean))]);
}

function preencherSelect(id, valores) {
  const select = document.getElementById(id);
  valores.sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

/* ---------- Filtro ---------- */
function filtrar() {
  const nome = document.getElementById('filter-nome').value.trim().toLowerCase();
  const cpf = onlyDigits(document.getElementById('filter-cpf').value);
  const dep = document.getElementById('filter-dep').value;
  const cargo = document.getElementById('filter-cargo').value;
  const status = document.getElementById('filter-status').value;

  renderTable(funcionarios.filter((f) =>
    (!nome || (f.nome || '').toLowerCase().includes(nome)) &&
    (!cpf || onlyDigits(f.cpf).includes(cpf)) &&
    (!dep || f.departamento === dep) &&
    (!cargo || f.cargo === cargo) &&
    (!status || (f.status || '').toString().trim().toUpperCase() === status)
  ));
}