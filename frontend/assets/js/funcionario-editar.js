const _deps = ['RH','TI','Marketing','Financeiro'];
const _cargos = ['Analista','Desenvolvedor','Designer','Gerente'];

function populateSelectsEditar(){
  const dep = document.getElementById('dep');
  const cargo = document.getElementById('cargo');
  _deps.forEach(d=>{ const o=document.createElement('option'); o.value=d; o.textContent=d; dep.appendChild(o); });
  _cargos.forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; cargo.appendChild(o); });
}

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

function handlePhotoDropzone(){
  const input = document.getElementById('photo');
  const preview = document.getElementById('photo-preview');
  const dropzone = document.getElementById('photo-dropzone');
  if(!dropzone || !input || !preview) return;

  ['dragenter','dragover'].forEach(evt=>
    dropzone.addEventListener(evt, (e)=>{ e.preventDefault(); dropzone.classList.add('dragover'); })
  );
  ['dragleave','drop'].forEach(evt=>
    dropzone.addEventListener(evt, (e)=>{ e.preventDefault(); dropzone.classList.remove('dragover'); })
  );
  dropzone.addEventListener('drop', (e)=>{
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if(!file || !file.type.startsWith('image/')) return;
    input.files = e.dataTransfer.files;
    const reader = new FileReader();
    reader.onload = (ev)=>{ preview.src = ev.target.result; };
    reader.readAsDataURL(file);
  });
}

function onlyDigits(str){ return (str||'').toString().replace(/\D+/g,''); }

function attachMask(el, maskFn){
  if(!el) return;
  el.addEventListener('input', ()=>{
    const pos = el.selectionStart;
    const before = el.value.length;
    el.value = maskFn(el.value);
    const after = el.value.length;
    el.selectionStart = el.selectionEnd = Math.max(0, pos + (after - before));
    clearInvalid(el);
  });
}

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

function maskCEP(value){
  return onlyDigits(value).slice(0,8).replace(/(\d{5})(\d)/, "$1-$2");
}

function maskPIS(value){
  return onlyDigits(value)
    .slice(0,11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{5})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{5})\.(\d{2})(\d)/, "$1.$2.$3-$4");
}

function wireUppercaseUF(){
  ['uf','ufCtps'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('input', ()=>{ el.value = el.value.toUpperCase().slice(0,2); });
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

function revealField(el){
  const pane = el.closest('.tab-pane');
  if(pane){
    const tabButton = document.querySelector(`[data-bs-target="#${pane.id}"]`);
    if(tabButton){
      window.bootstrap ? new bootstrap.Tab(tabButton).show() : tabButton.click();
    }
  }
  el.focus();
}

function wireCepLookup(){
  const cepInput = document.getElementById('cep');
  const cepStatus = document.getElementById('cep-status');
  const btnBuscarCep = document.getElementById('btn-buscar-cep');
  if(!cepInput) return;

  async function buscarCep(){
    const cep = onlyDigits(cepInput.value);

    if(cep.length !== 8){
      if(cepStatus){ cepStatus.textContent = 'Informe um CEP com 8 dígitos.'; cepStatus.classList.add('text-danger'); }
      return;
    }

    if(cepStatus){ cepStatus.textContent = 'Buscando endereço...'; cepStatus.classList.remove('text-danger'); }

    try{
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if(data.erro){
        if(cepStatus){ cepStatus.textContent = 'CEP não encontrado.'; cepStatus.classList.add('text-danger'); }
        return;
      }

      const map = { rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf };
      Object.entries(map).forEach(([id, value])=>{
        const el = document.getElementById(id);
        if(el && value) el.value = value;
      });

      if(cepStatus){ cepStatus.textContent = 'Endereço preenchido automaticamente.'; cepStatus.classList.remove('text-danger'); }
      const numeroEl = document.getElementById('numero');
      if(numeroEl) numeroEl.focus();
    }catch(err){
      if(cepStatus){ cepStatus.textContent = 'Não foi possível buscar o CEP agora. Preencha manualmente.'; cepStatus.classList.add('text-danger'); }
    }
  }

  if(btnBuscarCep) btnBuscarCep.addEventListener('click', buscarCep);
  cepInput.addEventListener('blur', ()=>{ if(onlyDigits(cepInput.value).length === 8) buscarCep(); });
}

function wireStepNavigation(){
  document.querySelectorAll('[data-step-next], [data-step-prev]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const targetId = btn.dataset.stepNext || btn.dataset.stepPrev;
      const targetTab = document.getElementById(targetId);
      if(targetTab){
        window.bootstrap ? new bootstrap.Tab(targetTab).show() : targetTab.click();
      }
    });
  });
}

function wireStepProgress(){
  const stepButtons = Array.from(document.querySelectorAll('#cadastroTab .nav-link'));
  if(!stepButtons.length) return;

  function updateProgress(activeId){
    const activeIndex = stepButtons.findIndex(b => b.id === activeId);
    stepButtons.forEach((btn, i)=>{
      const li = btn.closest('.step-item');
      const isComplete = i < activeIndex;
      btn.classList.toggle('step-complete', isComplete);
      if(li) li.classList.toggle('step-complete', isComplete);
    });
  }

  stepButtons.forEach(btn=>{
    btn.addEventListener('shown.bs.tab', ()=> updateProgress(btn.id));
  });

  updateProgress(stepButtons[0].id);
}

function carregarFuncionarioEmEdicao(){
  try{
    const raw = localStorage.getItem('editingFuncionario');
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}

function prefillValues(obj){
  if(!obj) return;

  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if(el) el.value = value ?? '';
  };

  setValue('nome', obj.nome);
  setValue('nomeSocial', obj.nomeSocial);
  setValue('cpf', obj.cpf);
  setValue('rg', obj.rg);
  setValue('nascimento', obj.nascimento);
  setValue('sexo', obj.sexo);
  setValue('estadoCivil', obj.estadoCivil);
  setValue('nacionalidade', obj.nacionalidade);
  setValue('naturalidade', obj.naturalidade);
  setValue('nomeMae', obj.nomeMae);
  setValue('nomePai', obj.nomePai);
  setValue('telefone', obj.telefone);
  setValue('email', obj.email);

  setValue('pis', obj.pis);
  setValue('tituloEleitor', obj.tituloEleitor);
  setValue('zonaEleitoral', obj.zonaEleitoral);
  setValue('secaoEleitoral', obj.secaoEleitoral);
  setValue('ctps', obj.ctps);
  setValue('serieCtps', obj.serieCtps);
  setValue('ufCtps', obj.ufCtps);
  setValue('cnh', obj.cnh);

  setValue('cep', obj.cep);
  setValue('rua', obj.rua);
  setValue('numero', obj.numero);
  setValue('complemento', obj.complemento);
  setValue('bairro', obj.bairro);
  setValue('cidade', obj.cidade);
  setValue('uf', obj.uf);
  setValue('pais', obj.pais || 'Brasil');

  setValue('admissao', obj.admissao);
  setValue('dep', obj.departamento);
  setValue('cargo', obj.cargo);
  setValue('salario', obj.salario);
  setValue('status', (obj.status || 'ATIVO').toString().trim().toUpperCase());
  setValue('matricula', obj.matricula);

  if(obj.foto){
    const preview = document.getElementById('photo-preview');
    if(preview) preview.src = obj.foto;
  }

  const formacao = obj.formacao || {};
  setValue('escolaridade', formacao.escolaridade);
  setValue('instituicaoEscolaridade', formacao.instituicaoEscolaridade);
  setValue('situacaoEscolaridade', formacao.situacaoEscolaridade);
  setValue('cursoSuperior', formacao.cursoSuperior);
  setValue('faculdade', formacao.faculdade);
  setValue('inicioSuperior', formacao.inicioSuperior);
  setValue('fimSuperior', formacao.fimSuperior);
  setValue('cursoProfissionalizante', formacao.cursoProfissionalizante);
  setValue('instituicaoCurso', formacao.instituicaoCurso);
  setValue('cargaHoraria', formacao.cargaHoraria);
  setValue('conclusaoCurso', formacao.conclusaoCurso);
  setValue('idioma', formacao.idioma);
  setValue('nivelIdioma', formacao.nivelIdioma);
  setValue('certificacao', formacao.certificacao);
  setValue('instituicaoCertificacao', formacao.instituicaoCertificacao);
  setValue('dataCertificacao', formacao.dataCertificacao);
}

function wireForm(funcionarioId){
  const form = document.getElementById('form-editar');

  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const nomeEl = document.getElementById('nome');
    const cpfEl = document.getElementById('cpf');
    const rgEl = document.getElementById('rg');
    const telEl = document.getElementById('telefone');
    const emailEl = document.getElementById('email');
    const admissaoEl = document.getElementById('admissao');
    const depEl = document.getElementById('dep');
    const cargoEl = document.getElementById('cargo');

    let valid = true;
    let firstInvalidEl = null;
    const markInvalid = (el, msg) => {
      setInvalid(el, msg);
      valid = false;
      if(!firstInvalidEl) firstInvalidEl = el;
    };

    if(!nomeEl.value.trim()){ markInvalid(nomeEl, 'Informe o nome completo.'); }
    if(!isValidCPF(cpfEl.value)){ markInvalid(cpfEl, 'CPF inválido. Informe 11 dígitos.'); }
    if(rgEl.value && onlyDigits(rgEl.value).length < 6){ markInvalid(rgEl, 'RG muito curto.'); }
    if(telEl.value && onlyDigits(telEl.value).length < 10){ markInvalid(telEl, 'Telefone inválido.'); }
    if(emailEl.value && !validateEmail(emailEl.value)){ markInvalid(emailEl, 'E-mail inválido.'); }
    if(!admissaoEl.value){ markInvalid(admissaoEl, 'Informe a data de admissão.'); }
    if(!depEl.value){ markInvalid(depEl, 'Selecione um departamento.'); }
    if(!cargoEl.value){ markInvalid(cargoEl, 'Selecione um cargo.'); }

    if(!valid){
      if(firstInvalidEl) revealField(firstInvalidEl);
      return;
    }

    const data = {
      id: funcionarioId,
      nome: document.getElementById('nome').value,
      nomeSocial: document.getElementById('nomeSocial').value,
      cpf: document.getElementById('cpf').value,
      rg: document.getElementById('rg').value,
      nascimento: document.getElementById('nascimento').value,
      telefone: document.getElementById('telefone').value,
      email: document.getElementById('email').value,
      estadoCivil: document.getElementById('estadoCivil').value,
      sexo: document.getElementById('sexo').value,
      nacionalidade: document.getElementById('nacionalidade').value,
      naturalidade: document.getElementById('naturalidade').value,
      nomeMae: document.getElementById('nomeMae').value,
      nomePai: document.getElementById('nomePai').value,
      pis: document.getElementById('pis').value,
      tituloEleitor: document.getElementById('tituloEleitor').value,
      zonaEleitoral: document.getElementById('zonaEleitoral').value,
      secaoEleitoral: document.getElementById('secaoEleitoral').value,
      ctps: document.getElementById('ctps').value,
      serieCtps: document.getElementById('serieCtps').value,
      ufCtps: document.getElementById('ufCtps').value,
      cnh: document.getElementById('cnh').value,
      cep: document.getElementById('cep').value,
      rua: document.getElementById('rua').value,
      numero: document.getElementById('numero').value,
      complemento: document.getElementById('complemento').value,
      bairro: document.getElementById('bairro').value,
      cidade: document.getElementById('cidade').value,
      uf: document.getElementById('uf').value,
      pais: document.getElementById('pais').value,
      endereco: (document.getElementById('rua').value || '') + (document.getElementById('numero').value ? (', ' + document.getElementById('numero').value) : ''),
      admissao: document.getElementById('admissao').value,
      departamento: document.getElementById('dep').value,
      cargo: document.getElementById('cargo').value,
      salario: document.getElementById('salario').value,
      status: document.getElementById('status').value,
      matricula: document.getElementById('matricula').value,
      formacao: {
        escolaridade: document.getElementById('escolaridade').value,
        instituicaoEscolaridade: document.getElementById('instituicaoEscolaridade').value,
        situacaoEscolaridade: document.getElementById('situacaoEscolaridade').value,
        cursoSuperior: document.getElementById('cursoSuperior').value,
        faculdade: document.getElementById('faculdade').value,
        inicioSuperior: document.getElementById('inicioSuperior').value,
        fimSuperior: document.getElementById('fimSuperior').value,
        cursoProfissionalizante: document.getElementById('cursoProfissionalizante').value,
        instituicaoCurso: document.getElementById('instituicaoCurso').value,
        cargaHoraria: document.getElementById('cargaHoraria').value,
        conclusaoCurso: document.getElementById('conclusaoCurso').value,
        idioma: document.getElementById('idioma').value,
        nivelIdioma: document.getElementById('nivelIdioma').value,
        certificacao: document.getElementById('certificacao').value,
        instituicaoCertificacao: document.getElementById('instituicaoCertificacao').value,
        dataCertificacao: document.getElementById('dataCertificacao').value
      }
    };

    const photoSrc = document.getElementById('photo-preview').src;
    data.foto = photoSrc && photoSrc.indexOf('avatar-placeholder') === -1 ? photoSrc : '';

    try{
      const STORAGE_KEY = 'funcionariosData';
      const raw = localStorage.getItem(STORAGE_KEY);
      let list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(x => x.id === funcionarioId);
      if(idx >= 0){
        list[idx] = Object.assign({}, list[idx], data);
      } else {
        list.push(data);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.removeItem('editingFuncionario');
      alert('Alterações salvas com sucesso.');
      window.location.href = 'funcionarios.html';
    }catch(err){
      console.error('Erro ao salvar edição', err);
      alert('Erro ao salvar as alterações. Veja o console.');
    }
  });

  function cancelarEdicao(){
    if(confirm('Cancelar edição e voltar para a lista?')){
      localStorage.removeItem('editingFuncionario');
      window.location.href = 'funcionarios.html';
    }
  }

  document.getElementById('btn-cancel').addEventListener('click', cancelarEdicao);
  const btnCancel2 = document.getElementById('btn-cancel-2');
  if(btnCancel2) btnCancel2.addEventListener('click', cancelarEdicao);
}

document.addEventListener('DOMContentLoaded', ()=>{
  populateSelectsEditar();
  handlePhotoInput();
  handlePhotoDropzone();
  maskCPFField(document.getElementById('cpf'));
  maskRGField(document.getElementById('rg'));
  maskPhoneField(document.getElementById('telefone'));
  attachMask(document.getElementById('cep'), maskCEP);
  attachMask(document.getElementById('pis'), maskPIS);
  wireUppercaseUF();
  wireCepLookup();
  wireStepNavigation();
  wireStepProgress();

  const funcionario = carregarFuncionarioEmEdicao();

  if(!funcionario){
    alert('Nenhum funcionário selecionado para edição.');
    window.location.href = 'funcionarios.html';
    return;
  }

  prefillValues(funcionario);
  document.getElementById('editar-subtitulo').textContent = `Atualizando os dados de ${funcionario.nome || 'funcionário'}.`;
  wireForm(funcionario.id);
});