// Reuse same deps/cargos from cadastro
const _deps = ['RH','TI','Marketing','Financeiro'];
const _cargos = ['Analista','Desenvolvedor','Designer','Gerente'];

function populateSelectsEditar(){
  const dep = document.getElementById('dep');
  const cargo = document.getElementById('cargo');
  _deps.forEach(d=>{ const o=document.createElement('option'); o.value=d; o.textContent=d; dep.appendChild(o); });
  _cargos.forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; cargo.appendChild(o); });
}

function handlePhotoInputEditar(){
  const input = document.getElementById('photo');
  const preview = document.getElementById('photo-preview');
  input.addEventListener('change', ()=>{
    const file = input.files && input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){ preview.src = e.target.result; }
    reader.readAsDataURL(file);
  });
}

function onlyDigits(str){ return (str||'').toString().replace(/\D+/g,''); }

function maskCPFField(el){
  el.addEventListener('input', ()=>{
    let v = onlyDigits(el.value).slice(0,11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    el.value = v;
    clearInvalid(el);
  });
}

function maskRGField(el){
  el.addEventListener('input', ()=>{
    let v = onlyDigits(el.value).slice(0,12);
    if(v.length <= 2){ el.value = v; return; }
    v = v.replace(/(\d{2})(\d)/, "$1.$2");
    v = v.replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    el.value = v;
    clearInvalid(el);
  });
}

function maskPhoneField(el){
  el.addEventListener('input', ()=>{
    let v = onlyDigits(el.value).slice(0,11);
    if(v.length <= 2){ el.value = v; return; }
    if(v.length <= 6){
      v = v.replace(/(\d{2})(\d+)/, '($1) $2');
    } else if(v.length <= 10){
      v = v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    } else {
      v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    el.value = v;
    clearInvalid(el);
  });
}

function isValidCPF(cpf){
  cpf = onlyDigits(cpf);
  if(!cpf || cpf.length !== 11) return false;
  if(/^([0-9])\1{10}$/.test(cpf)) return false;
  const calc = (t)=>{
    let sum = 0, i;
    for(i=0;i<t-1;i++) sum += Number(cpf.charAt(i)) * (t - i);
    let d = 11 - (sum % 11);
    return d > 9 ? 0 : d;
  }
  return calc(10) === Number(cpf.charAt(9)) && calc(11) === Number(cpf.charAt(10));
}

function setInvalid(el, msg){
  el.classList.add('is-invalid');
  let fb = el.parentNode.querySelector('.invalid-feedback');
  if(!fb){ fb = document.createElement('div'); fb.className='invalid-feedback'; el.parentNode.appendChild(fb); }
  fb.textContent = msg;
}

function clearInvalid(el){
  el.classList.remove('is-invalid');
  const fb = el.parentNode.querySelector('.invalid-feedback');
  if(fb) fb.textContent = '';
}

function validateEmail(email){
  if(!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function prefillFromLocalStorage(){
  try{
    const raw = localStorage.getItem('editingFuncionario');
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}

function wireEditarForm(){
  const form = document.getElementById('form-editar');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const cpfEl = document.getElementById('cpf');
    const rgEl = document.getElementById('rg');
    const telEl = document.getElementById('telefone');
    const emailEl = document.getElementById('email');
    let valid = true;
    if(!isValidCPF(cpfEl.value)){
      setInvalid(cpfEl, 'CPF inválido. Informe 11 dígitos.'); valid = false;
    }
    if(rgEl.value && onlyDigits(rgEl.value).length < 6){ setInvalid(rgEl, 'RG muito curto.'); valid = false; }
    if(telEl.value && onlyDigits(telEl.value).length < 10){ setInvalid(telEl, 'Telefone inválido.'); valid = false; }
    if(emailEl.value && !validateEmail(emailEl.value)){ setInvalid(emailEl, 'E-mail inválido.'); valid = false; }
    if(!valid) return;
    const data = {
      nome: document.getElementById('nome').value,
      cpf: document.getElementById('cpf').value,
      rg: document.getElementById('rg').value,
      nascimento: document.getElementById('nascimento').value,
      telefone: document.getElementById('telefone').value,
      email: document.getElementById('email').value,
      estadoCivil: document.getElementById('estadoCivil').value,
      sexo: document.getElementById('sexo').value,
      cep: document.getElementById('cep').value,
      rua: document.getElementById('rua').value,
      numero: document.getElementById('numero').value,
      complemento: document.getElementById('complemento').value,
      bairro: document.getElementById('bairro').value,
      cidade: document.getElementById('cidade').value,
      uf: document.getElementById('uf').value,
      endereco: (document.getElementById('rua').value || '') + (document.getElementById('numero').value ? (', ' + document.getElementById('numero').value) : ''),
      admissao: document.getElementById('admissao').value,
      departamento: document.getElementById('dep').value,
      cargo: document.getElementById('cargo').value,
      salario: document.getElementById('salario').value,
      status: document.getElementById('status').value
    };
    // include id from the editingFuncionario stored earlier
    try{
      const rawEditing = localStorage.getItem('editingFuncionario');
      if(rawEditing){
        const parsed = JSON.parse(rawEditing);
        if(parsed && parsed.id) data.id = parsed.id;
      }
    }catch(e){}
    // attach current photo preview (if not placeholder)
    try{
      const photoSrc = document.getElementById('photo-preview').src;
      if(photoSrc && photoSrc.indexOf('avatar-placeholder') === -1) data.foto = photoSrc; else data.foto = '';
    }catch(e){}
    console.log('Salvar edição (simulado):', data);
    alert('Alterações salvas (simulado).');
    // persist changes into stored funcionarios list (by id if present)
    try{
      const STORAGE_KEY = 'funcionariosData';
      const raw = localStorage.getItem(STORAGE_KEY);
      let list = raw ? JSON.parse(raw) : [];
      if(data && data.id){
        const idx = list.findIndex(x=>x.id===data.id);
        if(idx >= 0){ list[idx] = Object.assign({}, list[idx], data); }
        else { list.push(Object.assign({id:data.id}, data)); }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }catch(e){ console.warn('Erro ao persistir edição', e); }
    // cleanup
    try{ localStorage.removeItem('editingFuncionario'); }catch(e){}
    // navigate back to list
    window.location.href = 'funcionarios.html';
  });

  document.getElementById('btn-cancel').addEventListener('click', ()=>{
    if(confirm('Cancelar edição e voltar para a lista?')){
      window.location.href = 'funcionarios.html';
    }
  });
}

function prefillValues(obj){
  if(!obj) return;
  document.getElementById('nome').value = obj.nome || '';
  document.getElementById('cpf').value = obj.cpf || '';
  document.getElementById('rg').value = obj.rg || '';
  document.getElementById('nascimento').value = obj.nascimento || '';
  document.getElementById('telefone').value = obj.telefone || '';
  document.getElementById('email').value = obj.email || '';
  document.getElementById('estadoCivil').value = obj.estadoCivil || '';
  document.getElementById('sexo').value = obj.sexo || '';
  document.getElementById('cep').value = obj.cep || '';
  document.getElementById('rua').value = obj.rua || '';
  document.getElementById('numero').value = obj.numero || '';
  document.getElementById('complemento').value = obj.complemento || '';
  document.getElementById('bairro').value = obj.bairro || '';
  document.getElementById('cidade').value = obj.cidade || '';
  document.getElementById('uf').value = obj.uf || '';
  document.getElementById('endereco').value = obj.endereco || '';
  document.getElementById('admissao').value = obj.admissao || '';
  document.getElementById('dep').value = obj.departamento || '';
  document.getElementById('cargo').value = obj.cargo || '';
  document.getElementById('salario').value = obj.salario || '';
  document.getElementById('status').value = obj.status || (obj.status && obj.status.toLowerCase() === 'ativo' ? 'Ativo' : obj.status);
  if(obj.foto) document.getElementById('photo-preview').src = obj.foto;
}

document.addEventListener('DOMContentLoaded', ()=>{
  populateSelectsEditar();
  handlePhotoInputEditar();
  maskCPFField(document.getElementById('cpf'));
  maskRGField(document.getElementById('rg'));
  maskPhoneField(document.getElementById('telefone'));
  const obj = prefillFromLocalStorage();
  prefillValues(obj);
  wireEditarForm();
});
