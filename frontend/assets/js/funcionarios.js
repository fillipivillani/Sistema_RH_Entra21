let funcionarios = [
  { id: 1, nome: 'Ana Silva', cpf: '123.456.789-00', cargo: 'Analista', departamento: 'RH', status: 'Ativo', admissao: '2022-03-01' },
  { id: 2, nome: 'Bruno Costa', cpf: '987.654.321-11', cargo: 'Desenvolvedor', departamento: 'TI', status: 'Ativo', admissao: '2021-11-15' },
  { id: 3, nome: 'Carla Souza', cpf: '456.123.789-22', cargo: 'Designer', departamento: 'Marketing', status: 'Inativo', admissao: '2020-06-20' },
];

document.addEventListener('DOMContentLoaded', () => {
  renderTable(funcionarios);
  popularFiltros();

  document.getElementById('btn-filter').addEventListener('click', filtrar);
  document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('filters').reset();
    renderTable(funcionarios);
  });

  document.getElementById('table-funcionarios').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const func = funcionarios.find((f) => f.id === Number(btn.dataset.id));
    if (btn.dataset.action === 'edit') {
      localStorage.setItem('editingFuncionario', JSON.stringify(func));
      location.href = 'funcionario-editar.html';
    }
    if (btn.dataset.action === 'delete' && confirm(`Excluir ${func.nome}?`)) {
      funcionarios = funcionarios.filter((f) => f.id !== func.id);
      renderTable(funcionarios);
    }
  });
});

function renderTable(lista) {
  document.querySelector('#table-funcionarios tbody').innerHTML = lista.map((f) => `
    <tr>
      <td>${f.nome}</td>
      <td>${f.cpf}</td>
      <td>${f.cargo}</td>
      <td>${f.departamento}</td>
      <td>${f.status}</td>
      <td>${new Date(f.admissao).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${f.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${f.id}">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function popularFiltros() {
  preencherSelect('filter-dep', [...new Set(funcionarios.map((f) => f.departamento))]);
  preencherSelect('filter-cargo', [...new Set(funcionarios.map((f) => f.cargo))]);
}

function preencherSelect(id, valores) {
  const select = document.getElementById(id);
  valores.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function filtrar() {
  const nome = document.getElementById('filter-nome').value.toLowerCase();
  const cpf = document.getElementById('filter-cpf').value.toLowerCase();
  const dep = document.getElementById('filter-dep').value;
  const cargo = document.getElementById('filter-cargo').value;
  const status = document.getElementById('filter-status').value;

  renderTable(funcionarios.filter((f) =>
    (!nome || f.nome.toLowerCase().includes(nome)) &&
    (!cpf || f.cpf.toLowerCase().includes(cpf)) &&
    (!dep || f.departamento === dep) &&
    (!cargo || f.cargo === cargo) &&
    (!status || f.status.toLowerCase() === status)
  ));
}
