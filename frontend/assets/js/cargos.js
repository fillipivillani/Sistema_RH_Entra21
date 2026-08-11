const STORAGE_KEY = 'cargosData';
const PAGE_SIZE = 6;
const DEPS = ['RH', 'TI', 'Marketing', 'Financeiro'];
const SEED = [
  { id: 1, codigo: 'RH-001', nome: 'Analista de RH', departamento: 'RH', descricao: 'Recrutamento e rotinas de pessoal.', requisitos: 'Superior em Psicologia ou Administração.', escolaridade: 'Ensino Superior', salarioInicial: 3200, salarioMaximo: 4800, cargaHoraria: 40, tipoJornada: 'Híbrido', nivel: 'Pleno', status: 'ATIVO', dataCriacao: '2023-02-10', ultimaAtualizacao: '2024-05-02' },
  { id: 2, codigo: 'TI-010', nome: 'Desenvolvedor Front-end', departamento: 'TI', descricao: 'Interfaces web com frameworks modernos.', requisitos: 'HTML, CSS, JavaScript, React ou Vue.', escolaridade: 'Ensino Superior', salarioInicial: 5500, salarioMaximo: 8200, cargaHoraria: 40, tipoJornada: 'Remoto', nivel: 'Sênior', status: 'ATIVO', dataCriacao: '2022-11-20', ultimaAtualizacao: '2024-06-18' },
  { id: 3, codigo: 'MKT-004', nome: 'Analista de Marketing', departamento: 'Marketing', descricao: 'Campanhas digitais e institucionais.', requisitos: 'Marketing digital e redes sociais.', escolaridade: 'Ensino Superior', salarioInicial: 3000, salarioMaximo: 4500, cargaHoraria: 40, tipoJornada: 'Presencial', nivel: 'Júnior', status: 'ATIVO', dataCriacao: '2023-07-01', ultimaAtualizacao: '2023-07-01' },
  { id: 4, codigo: 'FIN-002', nome: 'Analista Financeiro', departamento: 'Financeiro', descricao: 'Contas a pagar/receber e relatórios.', requisitos: 'Contábeis, Economia ou Administração.', escolaridade: 'Ensino Superior', salarioInicial: 3800, salarioMaximo: 5600, cargaHoraria: 40, tipoJornada: 'Presencial', nivel: 'Pleno', status: 'ATIVO', dataCriacao: '2022-09-15', ultimaAtualizacao: '2024-01-10' },
  { id: 5, codigo: 'TI-021', nome: 'Coordenador de TI', departamento: 'TI', descricao: 'Coordena equipe e infraestrutura.', requisitos: 'Liderança de equipes técnicas.', escolaridade: 'Pós-Graduação', salarioInicial: 9000, salarioMaximo: 13000, cargaHoraria: 40, tipoJornada: 'Híbrido', nivel: 'Coordenador', status: 'ATIVO', dataCriacao: '2021-04-12', ultimaAtualizacao: '2024-03-22' },
  { id: 6, codigo: 'RH-005', nome: 'Gerente de RH', departamento: 'RH', descricao: 'Gestão de pessoas e políticas de RH.', requisitos: 'Experiência em gestão de pessoas.', escolaridade: 'Pós-Graduação', salarioInicial: 11000, salarioMaximo: 16000, cargaHoraria: 40, tipoJornada: 'Presencial', nivel: 'Gerente', status: 'ATIVO', dataCriacao: '2020-01-05', ultimaAtualizacao: '2023-12-01' },
  { id: 7, codigo: 'TI-003', nome: 'Estagiário de Suporte', departamento: 'TI', descricao: 'Suporte técnico e manutenção.', requisitos: 'Cursando TI.', escolaridade: 'Técnico', salarioInicial: 1400, salarioMaximo: 1800, cargaHoraria: 30, tipoJornada: 'Presencial', nivel: 'Júnior', status: 'INATIVO', dataCriacao: '2023-03-01', ultimaAtualizacao: '2023-09-15' },
  { id: 8, codigo: 'FIN-007', nome: 'Diretor Financeiro', departamento: 'Financeiro', descricao: 'Estratégia financeira corporativa.', requisitos: 'Experiência executiva em finanças.', escolaridade: 'MBA', salarioInicial: 18000, salarioMaximo: 26000, cargaHoraria: 44, tipoJornada: 'Presencial', nivel: 'Diretor', status: 'ATIVO', dataCriacao: '2019-06-01', ultimaAtualizacao: '2024-02-14' },
];

let cargos = RH.loadStorage(STORAGE_KEY, SEED);
let pagina = 1, deleteId = null, viewId = null;

document.addEventListener('DOMContentLoaded', () => {
  const modalCargo = new bootstrap.Modal(document.getElementById('modal-cargo'));
  const modalView = new bootstrap.Modal(document.getElementById('modal-visualizar'));
  const modalDel = new bootstrap.Modal(document.getElementById('modal-delete'));
  const form = document.getElementById('form-cargo');
  const title = document.getElementById('modal-cargo-title');
  const btnSave = document.getElementById('btn-salvar-cargo');
  const errEl = document.getElementById('form-erro');

  DEPS.forEach((d) => { RH.appendSelect('filter-departamento', [d]); RH.appendSelect('input-departamento', [d]); });
  render();

  document.getElementById('btn-novo-cargo').onclick = () => { resetForm(); title.textContent = 'Novo Cargo'; btnSave.textContent = 'Salvar'; modalCargo.show(); };
  document.getElementById('filters').onsubmit = (e) => e.preventDefault();
  document.getElementById('filter-nome').oninput = RH.debounce(() => { pagina = 1; render(); });
  ['filter-departamento', 'filter-status'].forEach((id) => document.getElementById(id).onchange = () => { pagina = 1; render(); });
  document.getElementById('btn-clear').onclick = () => { document.getElementById('filters').reset(); pagina = 1; render(); };

  document.getElementById('table-cargos').onclick = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const c = cargos.find((x) => x.id === Number(btn.dataset.id));
    if (!c) return;
    if (btn.dataset.action === 'visualizar') { fillView(c); modalView.show(); }
    if (btn.dataset.action === 'editar') { fillForm(c); title.textContent = 'Editar Cargo'; btnSave.textContent = 'Salvar alterações'; modalCargo.show(); }
    if (btn.dataset.action === 'deletar') { deleteId = c.id; document.getElementById('modal-delete-name').textContent = c.nome; modalDel.show(); }
  };

  document.getElementById('btn-editar-do-view').onclick = () => {
    const c = cargos.find((x) => x.id === viewId);
    modalView.hide();
    if (!c) return;
    fillForm(c); title.textContent = 'Editar Cargo'; btnSave.textContent = 'Salvar alterações'; modalCargo.show();
  };

  document.getElementById('btn-confirm-delete').onclick = () => {
    if (deleteId == null) return;
    const c = cargos.find((x) => x.id === deleteId);
    cargos = cargos.filter((x) => x.id !== deleteId);
    RH.saveStorage(STORAGE_KEY, cargos);
    modalDel.hide(); deleteId = null;
    RH.alert('success', `Cargo "${c?.nome || ''}" excluído.`);
    if (pagina > 1 && (pagina - 1) * PAGE_SIZE >= filtrados().length) pagina -= 1;
    render();
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    errEl.hidden = true;
    const dados = {
      nome: form.nome.value.trim(), codigo: form.codigo.value.trim().toUpperCase(),
      departamento: form.departamento.value, descricao: form.descricao.value.trim(),
      requisitos: form.requisitos.value.trim(), escolaridade: form.escolaridade.value,
      salarioInicial: parseFloat(form.salarioInicial.value), salarioMaximo: parseFloat(form.salarioMaximo.value),
      cargaHoraria: parseInt(form.cargaHoraria.value, 10), tipoJornada: form.tipoJornada.value,
      nivel: form.nivel.value, status: form.status.value || 'ATIVO',
    };
    const mark = (id, cond) => { document.getElementById(id).classList.toggle('is-invalid', cond); return cond; };
    let bad = mark('input-nome', !dados.nome) || mark('input-codigo', !dados.codigo)
      || mark('input-departamento', !dados.departamento) || mark('input-nivel', !dados.nivel)
      || mark('input-tipoJornada', !dados.tipoJornada)
      || mark('input-cargaHoraria', !(dados.cargaHoraria > 0))
      || mark('input-salarioInicial', !(dados.salarioInicial >= 0))
      || mark('input-salarioMaximo', !(dados.salarioMaximo >= 0 && dados.salarioMaximo >= dados.salarioInicial));
    if (cargos.some((c) => c.codigo === dados.codigo && c.id !== Number(form.id.value || 0))) {
      mark('input-codigo', true);
      errEl.textContent = `Já existe um cargo com o código "${dados.codigo}".`; errEl.hidden = false; bad = true;
    }
    if (bad) { form.classList.add('was-validated'); return; }

    const hoje = new Date().toISOString().slice(0, 10);
    const id = form.id.value ? Number(form.id.value) : null;
    if (id) {
      const i = cargos.findIndex((c) => c.id === id);
      if (i >= 0) cargos[i] = { ...cargos[i], ...dados, ultimaAtualizacao: hoje };
      RH.alert('success', `Cargo "${dados.nome}" atualizado.`);
    } else {
      cargos.push({ id: cargos.length ? Math.max(...cargos.map((c) => c.id)) + 1 : 1, ...dados, dataCriacao: hoje, ultimaAtualizacao: hoje });
      RH.alert('success', `Cargo "${dados.nome}" cadastrado.`);
    }
    RH.saveStorage(STORAGE_KEY, cargos);
    modalCargo.hide(); resetForm(); pagina = 1; render();
  };

  function resetForm() {
    form.reset(); form.classList.remove('was-validated'); form.id.value = ''; form.status.value = 'ATIVO';
    errEl.hidden = true;
    ['input-nome', 'input-codigo', 'input-departamento', 'input-nivel', 'input-cargaHoraria', 'input-salarioInicial', 'input-salarioMaximo', 'input-tipoJornada']
      .forEach((id) => document.getElementById(id).classList.remove('is-invalid'));
  }

  function fillForm(c) {
    resetForm(); form.id.value = c.id;
    Object.entries({ nome: c.nome, codigo: c.codigo, departamento: c.departamento, descricao: c.descricao, requisitos: c.requisitos, escolaridade: c.escolaridade, salarioInicial: c.salarioInicial, salarioMaximo: c.salarioMaximo, cargaHoraria: c.cargaHoraria, tipoJornada: c.tipoJornada, nivel: c.nivel, status: c.status || 'ATIVO' })
      .forEach(([k, v]) => { if (form[k]) form[k].value = v ?? ''; });
  }

  function fillView(c) {
    viewId = c.id;
    document.getElementById('view-nome').textContent = c.nome;
    document.getElementById('view-codigo').textContent = c.codigo;
    document.getElementById('view-departamento').textContent = c.departamento || '—';
    document.getElementById('view-nivel').textContent = c.nivel || '—';
    document.getElementById('view-status').innerHTML = RH.statusBadge(c.status);
    document.getElementById('view-salario').textContent = `${RH.formatCurrency(c.salarioInicial)} – ${RH.formatCurrency(c.salarioMaximo)}`;
    document.getElementById('view-cargaHoraria').textContent = c.cargaHoraria ? `${c.cargaHoraria}h semanais` : '—';
    document.getElementById('view-tipoJornada').textContent = c.tipoJornada || '—';
    document.getElementById('view-escolaridade').textContent = c.escolaridade || '—';
    document.getElementById('view-criado').textContent = RH.formatDate(c.dataCriacao);
    document.getElementById('view-atualizado').textContent = RH.formatDate(c.ultimaAtualizacao);
    document.getElementById('view-descricao').textContent = c.descricao || 'Sem descrição cadastrada.';
    document.getElementById('view-requisitos').textContent = c.requisitos || 'Sem requisitos cadastrados.';
  }

  function filtrados() {
    const nome = document.getElementById('filter-nome').value.trim().toLowerCase();
    const dep = document.getElementById('filter-departamento').value;
    const status = document.getElementById('filter-status').value;
    return cargos.filter((c) => (!nome || (c.nome || '').toLowerCase().includes(nome)) && (!dep || c.departamento === dep) && (!status || c.status === status));
  }

  function render() {
    const lista = filtrados();
    const totalPages = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
    if (pagina > totalPages) pagina = totalPages;

    RH.renderPagination({ navId: 'pagination', infoId: 'pagination-info', page: pagina, pageSize: PAGE_SIZE, total: lista.length, onPage: (p) => { pagina = p; render(); } });

    document.getElementById('results-summary').textContent = lista.length === cargos.length
      ? `${cargos.length} cargo${cargos.length === 1 ? '' : 's'} cadastrado${cargos.length === 1 ? '' : 's'}`
      : `${lista.length} de ${cargos.length} cargos`;

    const slice = lista.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);
    const tbody = document.querySelector('#table-cargos tbody');
    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🗂️</div><strong>Nenhum cargo encontrado</strong><span>Ajuste os filtros ou cadastre um novo cargo.</span></div></td></tr>`;
      return;
    }
    tbody.innerHTML = slice.map((c) => `<tr>
      <td class="cargo-code">${RH.escapeHtml(c.codigo)}</td><td class="cargo-name">${RH.escapeHtml(c.nome)}</td>
      <td>${RH.escapeHtml(c.departamento)}</td><td><span class="level-badge">${RH.escapeHtml(c.nivel)}</span></td>
      <td class="salario-range">${RH.formatCurrency(c.salarioInicial)} – ${RH.formatCurrency(c.salarioMaximo)}</td>
      <td>${RH.statusBadge(c.status)}</td>
      <td class="text-end actions">
        <button class="btn btn-sm btn-outline-secondary btn-icon-only" data-action="visualizar" data-id="${c.id}"><i class="bi bi-eye"></i></button>
        <button class="btn btn-sm btn-outline-secondary btn-icon-only" data-action="editar" data-id="${c.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger btn-icon-only" data-action="deletar" data-id="${c.id}"><i class="bi bi-trash"></i></button>
      </td></tr>`).join('');
  }
});
