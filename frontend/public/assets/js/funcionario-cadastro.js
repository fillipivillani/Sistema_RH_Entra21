// Yuri exemplo de departamentos e cargos (poderiam vir do backend)
const _deps = ['RH','TI','Marketing','Financeiro'];
const _cargos = ['Analista','Desenvolvedor','Designer','Gerente'];

function populateSelectsCadastro(){
  const dep = document.getElementById('dep');
  const cargo = document.getElementById('cargo');
  _deps.forEach(d=>{ const o=document.createElement('option'); o.value=d; o.textContent=d; dep.appendChild(o); });
  _cargos.forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; cargo.appendChild(o); });
}

// preview da imagem selecionada
function handlePhotoInput(){
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

// ====== Mascaras de validação ======
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
    // mascarar RG no formato XX.XXX.XXX-X (varia muito, mas é um formato comum)
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
  // invalido conhecido: todos os dígitos iguais (ex: 111.111.111-11)
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


function wireForm(){
  const form = document.getElementById('form-cadastro');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    // coleta de dados básicos
    // validações
    const cpfEl = document.getElementById('cpf');
    const rgEl = document.getElementById('rg');
    const telEl = document.getElementById('telefone');
    const emailEl = document.getElementById('email');
    let valid = true;
    // CPF obrigatório e válido
    if(!isValidCPF(cpfEl.value)){
      setInvalid(cpfEl, 'CPF inválido. Informe 11 dígitos.'); valid = false;
    }
    // RG se preenchido verificar apenas dígitos mínimos
    if(rgEl.value && onlyDigits(rgEl.value).length < 6){ setInvalid(rgEl, 'RG muito curto.'); valid = false; }
    // telefone: ao menos 10 dígitos
    if(telEl.value && onlyDigits(telEl.value).length < 10){ setInvalid(telEl, 'Telefone inválido.'); valid = false; }
    // email formato
    if(emailEl.value && !validateEmail(emailEl.value)){ setInvalid(emailEl, 'E-mail inválido.'); valid = false; }
    if(!valid){ return; }
    const data = {
      nome: document.getElementById('nome').value,
      cpf: document.getElementById('cpf').value,
      rg: document.getElementById('rg').value,
      nascimento: document.getElementById('nascimento').value,
      telefone: document.getElementById('telefone').value,
      email: document.getElementById('email').value,
      endereco: document.getElementById('endereco').value,
      admissao: document.getElementById('admissao').value,
      departamento: document.getElementById('dep').value,
      cargo: document.getElementById('cargo').value,
      salario: document.getElementById('salario').value,
      status: document.getElementById('status').value
    };
    console.log('Salvar (simulado):', data);
    alert('Funcionário salvo (simulado). Veja o console para os dados).');
    //Yuri aqui você poderia enviar para o backend via fetch
  });

  document.getElementById('btn-cancel').addEventListener('click', ()=>{
    if(confirm('Cancelar cadastro e limpar o formulário?')){
      form.reset();
      document.getElementById('photo-preview').src='/assets/images/avatar-placeholder.png';
    }
  });
}

document.addEventListener('DOMContentLoaded', function(){
  populateSelectsCadastro();
  handlePhotoInput();
  maskCPFField(document.getElementById('cpf'));
  maskRGField(document.getElementById('rg'));
  maskPhoneField(document.getElementById('telefone'));
  wireForm();
});
