const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const FALLBACK_FUNC = [
  { nome: 'Ana Silva', cargo: 'Analista', departamento: 'RH', status: 'ATIVO', admissao: '2022-03-01', nascimento: '1994-08-12' },
  { nome: 'Bruno Costa', cargo: 'Desenvolvedor', departamento: 'TI', status: 'ATIVO', admissao: '2021-11-15', nascimento: '1990-05-22' },
  { nome: 'Carla Souza', cargo: 'Designer', departamento: 'Marketing', status: 'INATIVO', admissao: '2020-06-20', nascimento: '1996-08-25' },
  { nome: 'Diego Almeida', cargo: 'Analista', departamento: 'Financeiro', status: 'ATIVO', admissao: '2023-09-04', nascimento: '1992-01-30' },
  { nome: 'Elaine Ferreira', cargo: 'Gerente', departamento: 'RH', status: 'ATIVO', admissao: '2019-04-12', nascimento: '1988-08-05' },
  { nome: 'Felipe Martins', cargo: 'Analista', departamento: 'TI', status: 'AFASTADO', admissao: '2022-01-10', nascimento: '1995-03-14' },
];
const FALLBACK_CARGOS = [{ status: 'ATIVO' }, { status: 'ATIVO' }, { status: 'ATIVO' }, { status: 'ATIVO' }, { status: 'ATIVO' }, { status: 'INATIVO' }];

const norm = (s) => (s || 'ATIVO').toString().trim().toUpperCase();
const parseData = (v) => {
  if (!v) return null;
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

document.addEventListener('DOMContentLoaded', () => {
  const funcionarios = ler('funcionariosData', FALLBACK_FUNC);
  const cargos = ler('cargosData', FALLBACK_CARGOS);
  const hoje = new Date();

  document.getElementById('dataAtual').textContent = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const ativos = funcionarios.filter((f) => norm(f.status) === 'ATIVO').length;
  const deps = [...new Set([...funcionarios.map((f) => f.departamento), ...cargos.map((c) => c.departamento)].filter(Boolean))];
  const contratacoes = funcionarios.filter((f) => {
    const d = parseData(f.admissao);
    return d && d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  }).length;

  document.getElementById('kpi-total-funcionarios').textContent = funcionarios.length;
  document.getElementById('kpi-total-funcionarios-sub').textContent = `${ativos} ativo${ativos === 1 ? '' : 's'}`;
  document.getElementById('kpi-departamentos').textContent = deps.length || 4;
  document.getElementById('kpi-novas-contratacoes').textContent = contratacoes;
  document.getElementById('kpi-novas-contratacoes-sub').textContent = `Em ${MESES[hoje.getMonth()]}`;
  document.getElementById('kpi-cargos-ativos').textContent = cargos.filter((c) => norm(c.status) === 'ATIVO').length;
  document.getElementById('kpi-cargos-ativos-sub').textContent = `${cargos.length} cadastrado${cargos.length === 1 ? '' : 's'}`;
  document.getElementById('kpi-taxa-ativos').textContent = `${funcionarios.length ? Math.round((ativos / funcionarios.length) * 100) : 0}%`;
  document.getElementById('kpi-taxa-ativos-sub').textContent = `${ativos} de ${funcionarios.length} colaboradores`;

  renderAniversariantes(funcionarios, hoje);
  renderAlertas(funcionarios, hoje);
  renderRecentes(funcionarios);
  renderGrafico(funcionarios);

  document.getElementById('btn-ver-todos').onclick = () => { window.location.href = 'funcionarios.html'; };
});

function ler(key, fallback) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    if (Array.isArray(data) && data.length) return data;
  } catch { /* noop */ }
  return fallback;
}

function renderAniversariantes(funcionarios, hoje) {
  document.getElementById('mes-atual-label').textContent = MESES[hoje.getMonth()];
  const lista = funcionarios.map((f) => {
    const n = parseData(f.nascimento);
    if (!n || n.getMonth() !== hoje.getMonth()) return null;
    return { nome: f.nome, dia: n.getDate(), idade: hoje.getFullYear() - n.getFullYear() };
  }).filter(Boolean).sort((a, b) => a.dia - b.dia);

  document.getElementById('badge-aniversariantes').textContent = `${lista.length} este mês`;
  const el = document.getElementById('listaAniversariantes');
  if (!lista.length) {
    el.innerHTML = `<li class="list-group-item"><div class="empty-hint"><i class="bi bi-cake2"></i>Nenhum aniversariante em ${MESES[hoje.getMonth()]}.</div></li>`;
    return;
  }
  el.innerHTML = lista.map((a) => `<li class="list-group-item d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3"><div class="list-icon warning"><i class="bi bi-gift"></i></div>
    <div><p class="list-title">${RH.escapeHtml(a.nome)}</p><span class="list-sub">Completando ${a.idade} anos</span></div></div>
    <span class="list-badge warning">${String(a.dia).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}</span></li>`).join('');
}

function renderAlertas(funcionarios, hoje) {
  const MS = 86400000;
  const alertas = funcionarios.filter((f) => norm(f.status) === 'ATIVO').map((f) => {
    const adm = parseData(f.admissao);
    if (!adm) return null;
    const fim = new Date(adm); fim.setDate(fim.getDate() + 90);
    const dias = Math.round((fim - hoje) / MS);
    return dias >= 0 && dias <= 30 ? { nome: f.nome, dias } : null;
  }).filter(Boolean).sort((a, b) => a.dias - b.dias);

  document.getElementById('badge-alertas').textContent = `${alertas.length} ações`;
  const el = document.getElementById('listaAlertasFerias');
  if (!alertas.length) {
    el.innerHTML = `<div class="empty-hint"><i class="bi bi-check2-circle"></i>Nenhum contrato de experiência vencendo nos próximos 30 dias.</div>`;
    return;
  }
  el.innerHTML = alertas.map((a) => `<div class="list-group-item d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3"><div class="list-icon danger"><i class="bi bi-clock-history"></i></div>
    <div><p class="list-title">${RH.escapeHtml(a.nome)}</p><span class="list-sub">Fim do período de experiência (90 dias)</span></div></div>
    <span class="list-badge ${a.dias <= 7 ? 'danger' : 'warning'}">${a.dias === 0 ? 'Hoje' : `Em ${a.dias} dia${a.dias === 1 ? '' : 's'}`}</span></div>`).join('');
}

function renderRecentes(funcionarios) {
  const lista = funcionarios.filter((f) => f.admissao).sort((a, b) => new Date(b.admissao) - new Date(a.admissao)).slice(0, 5);
  const tbody = document.getElementById('tabelaRecentes');
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-hint"><i class="bi bi-person-plus"></i>Nenhuma contratação registrada ainda.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map((f) => {
    const st = RH.STATUS[norm(f.status)] || RH.STATUS.ATIVO;
    return `<tr><td class="employee-name">${RH.escapeHtml(f.nome)}</td>
      <td class="text-muted small">${RH.escapeHtml(f.cargo || '—')}</td>
      <td><span class="dep-chip">${RH.escapeHtml(f.departamento || '—')}</span></td>
      <td><span class="status-badge ${st.className}">${st.label}</span></td></tr>`;
  }).join('');
}

function renderGrafico(funcionarios) {
  const canvas = document.getElementById('chartDepartamentos');
  if (!canvas || typeof Chart === 'undefined') return;
  const contagem = {};
  funcionarios.forEach((f) => { const d = f.departamento || 'Sem departamento'; contagem[d] = (contagem[d] || 0) + 1; });
  new Chart(canvas, {
    type: 'bar',
    data: { labels: Object.keys(contagem), datasets: [{ label: 'Funcionários', data: Object.values(contagem), backgroundColor: '#4f46e5', borderRadius: 8, maxBarThickness: 48 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } } },
  });
}
