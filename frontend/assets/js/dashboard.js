const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const STATUS_META = {
  ATIVO: { label: 'Ativo', className: 'status-ativo' },
  INATIVO: { label: 'Inativo', className: 'status-inativo' },
  AFASTADO: { label: 'Afastado', className: 'status-afastado' },
  DESLIGADO: { label: 'Desligado', className: 'status-desligado' },
};

// Usados apenas em memória caso o usuário ainda não tenha aberto as telas
// de Funcionários / Cargos (não são gravados no localStorage por aqui).
const FALLBACK_FUNCIONARIOS = [
  { nome: 'Ana Silva', cargo: 'Analista', departamento: 'RH', status: 'ATIVO', admissao: '2022-03-01', nascimento: '1994-08-12' },
  { nome: 'Bruno Costa', cargo: 'Desenvolvedor', departamento: 'TI', status: 'ATIVO', admissao: '2021-11-15', nascimento: '1990-05-22' },
  { nome: 'Carla Souza', cargo: 'Designer', departamento: 'Marketing', status: 'INATIVO', admissao: '2020-06-20', nascimento: '1996-08-25' },
  { nome: 'Diego Almeida', cargo: 'Analista', departamento: 'Financeiro', status: 'ATIVO', admissao: '2023-09-04', nascimento: '1992-01-30' },
  { nome: 'Elaine Ferreira', cargo: 'Gerente', departamento: 'RH', status: 'ATIVO', admissao: '2019-04-12', nascimento: '1988-08-05' },
  { nome: 'Felipe Martins', cargo: 'Analista', departamento: 'TI', status: 'AFASTADO', admissao: '2022-01-10', nascimento: '1995-03-14' },
];

const FALLBACK_CARGOS = [
  { status: 'ATIVO' }, { status: 'ATIVO' }, { status: 'ATIVO' },
  { status: 'ATIVO' }, { status: 'ATIVO' }, { status: 'INATIVO' },
];

const DEPARTAMENTOS_PADRAO = ['RH', 'TI', 'Marketing', 'Financeiro'];

document.addEventListener('DOMContentLoaded', () => {
  const funcionarios = lerFuncionarios();
  const cargos = lerCargos();

  renderDataAtual();
  renderKpis(funcionarios, cargos);
  renderAniversariantes(funcionarios);
  renderAlertasExperiencia(funcionarios);
  renderTabelaRecentes(funcionarios);
  renderGraficoDepartamentos(funcionarios);

  document.getElementById('btn-ver-todos').addEventListener('click', () => {
    window.location.href = 'funcionarios.html';
  });
});

/* ---------- Leitura de dados (sem gravar nada) ---------- */
function lerFuncionarios() {
  try {
    const raw = localStorage.getItem('funcionariosData');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {
    console.warn('Não foi possível ler funcionariosData; usando dados de demonstração.', e);
  }
  return FALLBACK_FUNCIONARIOS;
}

function lerCargos() {
  try {
    const raw = localStorage.getItem('cargosData');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {
    console.warn('Não foi possível ler cargosData; usando dados de demonstração.', e);
  }
  return FALLBACK_CARGOS;
}

/* ---------- Data atual ---------- */
function renderDataAtual() {
  const el = document.getElementById('dataAtual');
  if (!el) return;
  const hoje = new Date();
  el.textContent = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ---------- KPIs ---------- */
function renderKpis(funcionarios, cargos) {
  const total = funcionarios.length;
  const ativos = funcionarios.filter((f) => normalizarStatus(f.status) === 'ATIVO').length;

  document.getElementById('kpi-total-funcionarios').textContent = total;
  document.getElementById('kpi-total-funcionarios-sub').textContent = `${ativos} ativo${ativos === 1 ? '' : 's'}`;

  const departamentos = nomesDepartamentos(funcionarios, cargos);
  document.getElementById('kpi-departamentos').textContent = departamentos.length;

  const hoje = new Date();
  const novasContratacoes = funcionarios.filter((f) => {
    const d = parseData(f.admissao);
    return d && d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  }).length;
  document.getElementById('kpi-novas-contratacoes').textContent = novasContratacoes;
  document.getElementById('kpi-novas-contratacoes-sub').textContent = `Em ${MESES_PT[hoje.getMonth()]}`;

  const cargosAtivos = cargos.filter((c) => normalizarStatus(c.status) === 'ATIVO').length;
  document.getElementById('kpi-cargos-ativos').textContent = cargosAtivos;
  document.getElementById('kpi-cargos-ativos-sub').textContent = `${cargos.length} cadastrado${cargos.length === 1 ? '' : 's'}`;

  const taxaAtivos = total ? Math.round((ativos / total) * 100) : 0;
  document.getElementById('kpi-taxa-ativos').textContent = `${taxaAtivos}%`;
  document.getElementById('kpi-taxa-ativos-sub').textContent = `${ativos} de ${total} colaboradores`;
}

function nomesDepartamentos(funcionarios, cargos) {
  const set = new Set([
    ...funcionarios.map((f) => f.departamento).filter(Boolean),
    ...cargos.map((c) => c.departamento).filter(Boolean),
  ]);
  return set.size ? [...set] : DEPARTAMENTOS_PADRAO;
}

/* ---------- Aniversariantes do mês ---------- */
function renderAniversariantes(funcionarios) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  document.getElementById('mes-atual-label').textContent = MESES_PT[mesAtual];

  const aniversariantes = funcionarios
    .map((f) => {
      const nasc = parseData(f.nascimento);
      if (!nasc || nasc.getMonth() !== mesAtual) return null;
      const idade = hoje.getFullYear() - nasc.getFullYear();
      return { nome: f.nome, dia: nasc.getDate(), idade };
    })
    .filter(Boolean)
    .sort((a, b) => a.dia - b.dia);

  document.getElementById('badge-aniversariantes').textContent =
    `${aniversariantes.length} este mês`;

  const lista = document.getElementById('listaAniversariantes');

  if (!aniversariantes.length) {
    lista.innerHTML = `
      <li class="list-group-item">
        <div class="empty-hint">
          <i class="bi bi-cake2"></i>
          Nenhum aniversariante em ${MESES_PT[mesAtual]}.
        </div>
      </li>
    `;
    return;
  }

  lista.innerHTML = aniversariantes.map((a) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <div class="list-icon warning"><i class="bi bi-gift"></i></div>
        <div>
          <p class="list-title">${escapeHtml(a.nome)}</p>
          <span class="list-sub">Completando ${a.idade} anos</span>
        </div>
      </div>
      <span class="list-badge warning">${String(a.dia).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}</span>
    </li>
  `).join('');
}

/* ---------- Alertas de período de experiência (admissão + 90 dias) ---------- */
function renderAlertasExperiencia(funcionarios) {
  const hoje = new Date();
  const MS_DIA = 1000 * 60 * 60 * 24;

  const alertas = funcionarios
    .filter((f) => normalizarStatus(f.status) === 'ATIVO')
    .map((f) => {
      const admissao = parseData(f.admissao);
      if (!admissao) return null;
      const fimExperiencia = new Date(admissao);
      fimExperiencia.setDate(fimExperiencia.getDate() + 90);
      const diasRestantes = Math.round((fimExperiencia - hoje) / MS_DIA);
      if (diasRestantes < 0 || diasRestantes > 30) return null;
      return { nome: f.nome, diasRestantes };
    })
    .filter(Boolean)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  document.getElementById('badge-alertas').textContent = `${alertas.length} ações`;

  const container = document.getElementById('listaAlertasFerias');

  if (!alertas.length) {
    container.innerHTML = `
      <div class="empty-hint">
        <i class="bi bi-check2-circle"></i>
        Nenhum contrato de experiência vencendo nos próximos 30 dias.
      </div>
    `;
    return;
  }

  container.innerHTML = alertas.map((a) => {
    const urgente = a.diasRestantes <= 7;
    return `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="list-icon danger"><i class="bi bi-clock-history"></i></div>
          <div>
            <p class="list-title">${escapeHtml(a.nome)}</p>
            <span class="list-sub">Fim do período de experiência (90 dias)</span>
          </div>
        </div>
        <span class="list-badge ${urgente ? 'danger' : 'warning'}">
          ${a.diasRestantes === 0 ? 'Hoje' : `Em ${a.diasRestantes} dia${a.diasRestantes === 1 ? '' : 's'}`}
        </span>
      </div>
    `;
  }).join('');
}

/* ---------- Últimas contratações ---------- */
function renderTabelaRecentes(funcionarios) {
  const ordenados = funcionarios
    .filter((f) => f.admissao)
    .slice()
    .sort((a, b) => new Date(b.admissao) - new Date(a.admissao))
    .slice(0, 5);

  const tbody = document.getElementById('tabelaRecentes');

  if (!ordenados.length) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="empty-hint"><i class="bi bi-person-plus"></i>Nenhuma contratação registrada ainda.</div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = ordenados.map((f) => {
    const status = STATUS_META[normalizarStatus(f.status)] || STATUS_META.ATIVO;
    return `
      <tr>
        <td class="employee-name">${escapeHtml(f.nome)}</td>
        <td class="text-muted small">${escapeHtml(f.cargo || '—')}</td>
        <td><span class="dep-chip">${escapeHtml(f.departamento || '—')}</span></td>
        <td><span class="status-badge ${status.className}">${status.label}</span></td>
      </tr>
    `;
  }).join('');
}

/* ---------- Gráfico: funcionários por departamento ---------- */
function renderGraficoDepartamentos(funcionarios) {
  const canvas = document.getElementById('chartDepartamentos');
  if (!canvas || typeof Chart === 'undefined') return;

  const contagem = {};
  funcionarios.forEach((f) => {
    const dep = f.departamento || 'Sem departamento';
    contagem[dep] = (contagem[dep] || 0) + 1;
  });

  const labels = Object.keys(contagem);
  const valores = Object.values(contagem);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Funcionários',
        data: valores,
        backgroundColor: '#4f46e5',
        borderRadius: 8,
        maxBarThickness: 48,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } },
      },
    },
  });
}

/* ---------- Utilitários ---------- */
function normalizarStatus(status) {
  return (status || 'ATIVO').toString().trim().toUpperCase();
}

function parseData(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function escapeHtml(str) {
  return (str ?? '').toString().replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}