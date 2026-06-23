// Dados de exemplo "MOCK" - em um cenário real, esses dados viriam do backend via API pessoal
let funcionarios = [
  {id:1,nome:'Ana Silva',cpf:'123.456.789-00',cargo:'Analista',departamento:'RH',status:'Ativo',admissao:'2022-03-01',foto:'../assets/images/avatar-placeholder.png'},
  {id:2,nome:'Bruno Costa',cpf:'987.654.321-11',cargo:'Desenvolvedor',departamento:'TI',status:'Ativo',admissao:'2021-11-15',foto:'../assets/images/avatar-placeholder.png'},
  {id:3,nome:'Carla Souza',cpf:'456.123.789-22',cargo:'Designer',departamento:'Marketing',status:'Inativo',admissao:'2020-06-20',foto:'../assets/images/avatar-placeholder.png'}
];

const STORAGE_KEY = 'funcionariosData';

function loadStoredFuncionarios(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) funcionarios = parsed;
    } else {
      // save initial mock
      localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
    }
  }catch(e){ console.warn('Erro ao carregar funcionarios do localStorage', e); }
}

function saveStoredFuncionarios(list){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }catch(e){ console.warn('Erro ao salvar funcionarios', e); }
}

function formatDate(d){
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

function renderTable(list){
  const tbody = document.querySelector('#table-funcionarios tbody');
  tbody.innerHTML = '';
  list.forEach(f=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img class="avatar" src="${f.foto && f.foto.length ? f.foto : '../assets/images/avatar-placeholder.png'}" alt="Foto"></td>
      <td>${f.nome}</td>
      <td>${f.cpf}</td>
      <td>${f.cargo}</td>
      <td>${f.departamento}</td>
      <td>${f.status}</td>
      <td>${formatDate(f.admissao)}</td>
      <td class="actions">
        <button class="btn btn-sm btn-outline-primary" data-action="view" data-id="${f.id}">Visualizar</button>
        <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${f.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${f.id}">Excluir</button>
        <button class="btn btn-sm btn-outline-info" data-action="ficha" data-id="${f.id}">Ficha</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function applyFilters(){
  const nome = document.getElementById('filter-nome').value.toLowerCase();
  const cpf = document.getElementById('filter-cpf').value.toLowerCase();
  const dep = document.getElementById('filter-dep').value;
  const cargo = document.getElementById('filter-cargo').value;
  const status = document.getElementById('filter-status').value;

  let filtered = funcionarios.filter(f=>{
    if(nome && !f.nome.toLowerCase().includes(nome)) return false;
    if(cpf && !f.cpf.toLowerCase().includes(cpf)) return false;
    if(dep && f.departamento !== dep) return false;
    if(cargo && f.cargo !== cargo) return false;
    if(status && f.status.toLowerCase() !== status) return false;
    return true;
  });
  renderTable(filtered);
}

function wireActions(){
  document.getElementById('table-funcionarios').addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const action = btn.getAttribute('data-action');
    const id = Number(btn.getAttribute('data-id'));
    const func = funcionarios.find(x=>x.id===id);
    if(action==='view'){
      alert('Visualizar: '+func.nome);
    }else if(action==='edit'){
        // store the selected employee in localStorage and navigate to the edit page
        try{
          localStorage.setItem('editingFuncionario', JSON.stringify(func));
        }catch(e){ console.warn('localStorage not available', e); }
        window.location.href = 'funcionario-editar.html';
    }else if(action==='delete'){
      if(confirm('Deseja excluir '+func.nome+'?')){
        alert('Excluído (simulado)');
      }
    }else if(action==='ficha'){
      alert('Abrir ficha funcional: '+func.nome);
    }
  });
}

function populateSelects(){
  const deps = [...new Set(funcionarios.map(f=>f.departamento))];
  const cargos = [...new Set(funcionarios.map(f=>f.cargo))];
  const depSel = document.getElementById('filter-dep');
  const cargoSel = document.getElementById('filter-cargo');
  deps.forEach(d=>{
    const opt = document.createElement('option'); opt.value=d; opt.textContent=d; depSel.appendChild(opt);
  });
  cargos.forEach(c=>{
    const opt = document.createElement('option'); opt.value=c; opt.textContent=c; cargoSel.appendChild(opt);
  });
}

document.addEventListener('DOMContentLoaded', function(){
  // try to load stored funcionarios (persisted edits and photos)
  loadStoredFuncionarios();
  populateSelects();
  renderTable(funcionarios);
  wireActions();
  document.getElementById('btn-filter').addEventListener('click', applyFilters);
  document.getElementById('btn-clear').addEventListener('click', ()=>{document.getElementById('filters').reset(); renderTable(funcionarios);});
  document.getElementById('btn-new').addEventListener('click', ()=>{ window.location.href = 'funcionario-cadastro.html'; });
});
