let funcionarios = [];
let deleteTargetId = null;
let deleteModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  deleteModal = new bootstrap.Modal(document.getElementById('modal-delete'));

  await carregar();

  const form = document.getElementById('filters');
  form.addEventListener('submit', (e) => { e.preventDefault(); filtrar(); });

  ['filter-nome', 'filter-cpf'].forEach((id) =>
    document.getElementById(id).addEventListener('input', RH.debounce(filtrar)));
  ['filter-dep', 'filter-cargo', 'filter-status'].forEach((id) =>
    document.getElementById(id).addEventListener('change', filtrar));

  document.getElementById('btn-clear').onclick = () => { form.reset(); renderTable(funcionarios); };

  document.getElementById('table-funcionarios').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const func = funcionarios.find((f) => String(f.id) === btn.dataset.id);
    if (!func) return;

    if (btn.dataset.action === 'edit') {
      // guardamos só o id: a página de edição busca os dados atuais na API
      sessionStorage.setItem('editingFuncionarioId', String(func.id));
      location.href = 'funcionario-editar.html';
    }
    if (btn.dataset.action === 'delete') {
      deleteTargetId = func.id;
      document.getElementById('modal-delete-name').textContent = func.nome || 'este funcionário';
      deleteModal.show();
    }
  });

  document.getElementById('btn-confirm-delete').onclick = async () => {
    if (deleteTargetId == null) return;
    const btn = document.getElementById('btn-confirm-delete');
    btn.disabled = true;
    try {
      await API.funcionarios.deletar(deleteTargetId);
      deleteTargetId = null;
      deleteModal.hide();
      await carregar();
    } catch (err) {
      deleteModal.hide();
      alert(err.message || 'Não foi possível excluir o funcionário.');
    } finally {
      btn.disabled = false;
    }
  };
});

async function carregar() {
  funcionarios = await API.funcionarios.listar();
  popularFiltros();
  renderTable(funcionarios);
}

function renderTable(lista) {
  const tbody = document.querySelector('#table-funcionarios tbody');
  const summary = document.getElementById('results-summary');

  summary.textContent = lista.length === funcionarios.length
    ? `${funcionarios.length} funcionário${funcionarios.length === 1 ? '' : 's'} cadastrado${funcionarios.length === 1 ? '' : 's'}`
    : `${lista.length} de ${funcionarios.length} funcionários`;

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <div class="empty-icon">🗂️</div><strong>Nenhum funcionário encontrado</strong>
      <span>Ajuste os filtros ou cadastre um novo funcionário.</span></div></td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map((f) => {
    const st = RH.STATUS[(f.status || '').toString().trim().toUpperCase()] || RH.STATUS.INATIVO;
    const foto = f.foto && !f.foto.includes('avatar-placeholder') ? f.foto : '../assets/images/avatar-placeholder.png';
    return `<tr>
      <td class="col-avatar"><img src="${RH.escapeHtml(foto)}" class="avatar" alt="Foto de ${RH.escapeHtml(f.nome)}"></td>
      <td class="employee-name">${RH.escapeHtml(f.nome)}</td>
      <td>${RH.escapeHtml(f.cpf)}</td><td>${RH.escapeHtml(f.cargo)}</td>
      <td>${RH.escapeHtml(f.departamento)}</td>
      <td><span class="status-badge ${st.className}">${RH.escapeHtml(st.label)}</span></td>
      <td>${RH.formatDate(f.admissao)}</td>
      <td class="text-end actions">
        <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${f.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${f.id}">Excluir</button>
      </td></tr>`;
  }).join('');
}

function popularFiltros() {
  const uniq = (key) => [...new Set(funcionarios.map((f) => f[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  RH.appendSelect('filter-dep', uniq('departamento'));
  RH.appendSelect('filter-cargo', uniq('cargo'));
}

function filtrar() {
  const nome = document.getElementById('filter-nome').value.trim().toLowerCase();
  const cpf = RH.onlyDigits(document.getElementById('filter-cpf').value);
  const dep = document.getElementById('filter-dep').value;
  const cargo = document.getElementById('filter-cargo').value;
  const status = document.getElementById('filter-status').value;

  renderTable(funcionarios.filter((f) =>
    (!nome || (f.nome || '').toLowerCase().includes(nome)) &&
    (!cpf || RH.onlyDigits(f.cpf).includes(cpf)) &&
    (!dep || f.departamento === dep) &&
    (!cargo || f.cargo === cargo) &&
    (!status || (f.status || '').toString().trim().toUpperCase() === status)
  ));
}