/** Formulário compartilhado: cadastro e edição de funcionário */
const FuncionarioForm = (() => {
  const DEPS = ['RH', 'TI', 'Marketing', 'Financeiro'];
  const CARGOS = ['Analista', 'Desenvolvedor', 'Designer', 'Gerente'];
  const STORAGE_KEY = 'funcionariosData';
  const FORMACAO = [
    'escolaridade', 'instituicaoEscolaridade', 'situacaoEscolaridade', 'cursoSuperior',
    'faculdade', 'inicioSuperior', 'fimSuperior', 'cursoProfissionalizante',
    'instituicaoCurso', 'cargaHoraria', 'conclusaoCurso', 'idioma', 'nivelIdioma',
    'certificacao', 'instituicaoCertificacao', 'dataCertificacao',
  ];

  const $ = (id) => document.getElementById(id);
  const val = (id) => $(id)?.value ?? '';
  const digits = RH.onlyDigits;

  function setInvalid(el, msg) {
    el.classList.add('is-invalid');
    let fb = el.parentNode.querySelector('.invalid-feedback');
    if (!fb) { fb = document.createElement('div'); fb.className = 'invalid-feedback'; el.parentNode.appendChild(fb); }
    fb.textContent = msg;
  }

  function clearInvalid(el) {
    el.classList.remove('is-invalid');
    const fb = el.parentNode.querySelector('.invalid-feedback');
    if (fb) fb.textContent = '';
  }

  function isValidCPF(cpf) {
    cpf = digits(cpf);
    if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    const check = (t) => {
      let s = 0;
      for (let i = 0; i < t - 1; i++) s += +cpf[i] * (t - i);
      const d = 11 - (s % 11);
      return d > 9 ? 0 : d;
    };
    return check(10) === +cpf[9] && check(11) === +cpf[10];
  }

  function maskInput(el, fn) {
    if (!el) return;
    el.addEventListener('input', () => {
      const pos = el.selectionStart;
      const len = el.value.length;
      el.value = fn(el.value);
      el.selectionStart = el.selectionEnd = Math.max(0, pos + (el.value.length - len));
      clearInvalid(el);
    });
  }

  function maskCPF(v) {
    v = digits(v).slice(0, 11);
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }

  function maskRG(v) {
    v = digits(v).slice(0, 12);
    if (v.length <= 2) return v;
    return v.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }

  function maskPhone(v) {
    v = digits(v).slice(0, 11);
    if (v.length <= 2) return v;
    if (v.length <= 6) return v.replace(/(\d{2})(\d+)/, '($1) $2');
    if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  function maskCEP(v) { return digits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'); }

  function maskPIS(v) {
    return digits(v).slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{5})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{5})\.(\d{2})(\d)/, '$1.$2.$3-$4');
  }

  function revealField(el) {
    const pane = el.closest('.tab-pane');
    if (pane) RH.showTab(document.querySelector(`[data-bs-target="#${pane.id}"]`));
    el.focus();
  }

  function previewFile(file, preview) {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => { preview.src = e.target.result; };
    r.readAsDataURL(file);
  }

  function wirePhoto() {
    const input = $('photo'), preview = $('photo-preview'), drop = $('photo-dropzone');
    if (!input || !preview) return;

    input.addEventListener('change', () => previewFile(input.files?.[0], preview));

    if (!drop) return;
    ['dragenter', 'dragover'].forEach((e) =>
      drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach((e) =>
      drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove('dragover'); }));
    drop.addEventListener('drop', (ev) => {
      const file = ev.dataTransfer.files?.[0];
      if (!file?.type.startsWith('image/')) return;
      input.files = ev.dataTransfer.files;
      previewFile(file, preview);
    });
  }

  function wireMasks() {
    maskInput($('cpf'), maskCPF);
    maskInput($('rg'), maskRG);
    maskInput($('telefone'), maskPhone);
    maskInput($('cep'), maskCEP);
    maskInput($('pis'), maskPIS);
    ['uf', 'ufCtps'].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener('input', () => { el.value = el.value.toUpperCase().slice(0, 2); });
    });
  }

  async function buscarCep() {
    const cepInput = $('cep'), status = $('cep-status');
    const cep = digits(cepInput?.value);
    if (cep.length !== 8) {
      if (status) { status.textContent = 'Informe um CEP com 8 dígitos.'; status.classList.add('text-danger'); }
      return;
    }
    if (status) { status.textContent = 'Buscando endereço...'; status.classList.remove('text-danger'); }
    try {
      const data = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((r) => r.json());
      if (data.erro) {
        if (status) { status.textContent = 'CEP não encontrado.'; status.classList.add('text-danger'); }
        return;
      }
      [['rua', data.logradouro], ['bairro', data.bairro], ['cidade', data.localidade], ['uf', data.uf]]
        .forEach(([id, v]) => { if ($(id) && v) $(id).value = v; });
      if (status) { status.textContent = 'Endereço preenchido automaticamente.'; status.classList.remove('text-danger'); }
      $('numero')?.focus();
    } catch {
      if (status) { status.textContent = 'Não foi possível buscar o CEP. Preencha manualmente.'; status.classList.add('text-danger'); }
    }
  }

  function wireCep() {
    $('btn-buscar-cep')?.addEventListener('click', buscarCep);
    $('cep')?.addEventListener('blur', () => { if (digits($('cep').value).length === 8) buscarCep(); });
  }

  function wireSteps() {
    document.querySelectorAll('[data-step-next], [data-step-prev]').forEach((btn) => {
      btn.addEventListener('click', () => RH.showTab($(btn.dataset.stepNext || btn.dataset.stepPrev)));
    });

    const tabs = [...document.querySelectorAll('#cadastroTab .nav-link')];
    if (!tabs.length) return;

    const update = (activeId) => {
      const idx = tabs.findIndex((b) => b.id === activeId);
      tabs.forEach((btn, i) => {
        btn.classList.toggle('step-complete', i < idx);
        btn.closest('.step-item')?.classList.toggle('step-complete', i < idx);
      });
    };

    tabs.forEach((btn) => btn.addEventListener('shown.bs.tab', () => update(btn.id)));
    update(tabs[0].id);
  }

  function validate() {
    const rules = [
      [$('nome'), !val('nome').trim(), 'Informe o nome completo.'],
      [$('cpf'), !isValidCPF(val('cpf')), 'CPF inválido. Informe 11 dígitos.'],
      [$('rg'), val('rg') && digits(val('rg')).length < 6, 'RG muito curto.'],
      [$('telefone'), val('telefone') && digits(val('telefone')).length < 10, 'Telefone inválido.'],
      [$('email'), val('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email')), 'E-mail inválido.'],
      [$('admissao'), !val('admissao'), 'Informe a data de admissão.'],
      [$('dep'), !val('dep'), 'Selecione um departamento.'],
      [$('cargo'), !val('cargo'), 'Selecione um cargo.'],
    ];

    let first = null;
    rules.forEach(([el, invalid, msg]) => {
      if (!el) return;
      if (invalid) { setInvalid(el, msg); if (!first) first = el; }
      else clearInvalid(el);
    });
    if (first) revealField(first);
    return !first;
  }

  function collectData(id) {
    const rua = val('rua'), numero = val('numero');
    const src = $('photo-preview')?.src || '';
    return {
      id,
      nome: val('nome'), nomeSocial: val('nomeSocial'), cpf: val('cpf'), rg: val('rg'),
      nascimento: val('nascimento'), telefone: val('telefone'), email: val('email'),
      estadoCivil: val('estadoCivil'), sexo: val('sexo'), nacionalidade: val('nacionalidade'),
      naturalidade: val('naturalidade'), nomeMae: val('nomeMae'), nomePai: val('nomePai'),
      pis: val('pis'), tituloEleitor: val('tituloEleitor'), zonaEleitoral: val('zonaEleitoral'),
      secaoEleitoral: val('secaoEleitoral'), ctps: val('ctps'), serieCtps: val('serieCtps'),
      ufCtps: val('ufCtps'), cnh: val('cnh'), cep: val('cep'), rua, numero,
      complemento: val('complemento'), bairro: val('bairro'), cidade: val('cidade'),
      uf: val('uf'), pais: val('pais'), endereco: rua + (numero ? `, ${numero}` : ''),
      admissao: val('admissao'), departamento: val('dep'), cargo: val('cargo'),
      salario: val('salario'), status: val('status'), matricula: val('matricula'),
      formacao: Object.fromEntries(FORMACAO.map((k) => [k, val(k)])),
      foto: src.includes('avatar-placeholder') ? '' : src,
    };
  }

  function prefill(obj) {
    if (!obj) return;
    const map = {
      nome: 'nome', nomeSocial: 'nomeSocial', cpf: 'cpf', rg: 'rg', nascimento: 'nascimento',
      sexo: 'sexo', estadoCivil: 'estadoCivil', nacionalidade: 'nacionalidade',
      naturalidade: 'naturalidade', nomeMae: 'nomeMae', nomePai: 'nomePai',
      telefone: 'telefone', email: 'email', pis: 'pis', tituloEleitor: 'tituloEleitor',
      zonaEleitoral: 'zonaEleitoral', secaoEleitoral: 'secaoEleitoral', ctps: 'ctps',
      serieCtps: 'serieCtps', ufCtps: 'ufCtps', cnh: 'cnh', cep: 'cep', rua: 'rua',
      numero: 'numero', complemento: 'complemento', bairro: 'bairro', cidade: 'cidade',
      uf: 'uf', admissao: 'admissao', salario: 'salario', matricula: 'matricula',
      departamento: 'dep', cargo: 'cargo',
    };
    Object.entries(map).forEach(([k, id]) => { if ($(id)) $(id).value = obj[k] ?? ''; });
    if ($('pais')) $('pais').value = obj.pais || 'Brasil';
    if ($('status')) $('status').value = (obj.status || 'ATIVO').toString().trim().toUpperCase();
    if (obj.foto && $('photo-preview')) $('photo-preview').src = obj.foto;
    FORMACAO.forEach((k) => { if ($(k)) $(k).value = obj.formacao?.[k] ?? ''; });
  }

  function save(data, isEdit) {
    const list = RH.loadStorage(STORAGE_KEY, []);
    if (isEdit) {
      const i = list.findIndex((x) => x.id === data.id);
      if (i >= 0) list[i] = { ...list[i], ...data };
      else list.push(data);
      localStorage.removeItem('editingFuncionario');
    } else {
      data.id = list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
      list.push(data);
    }
    RH.saveStorage(STORAGE_KEY, list);
    alert(isEdit ? 'Alterações salvas com sucesso.' : 'Funcionário salvo com sucesso.');
    window.location.href = 'funcionarios.html';
  }

  function init({ mode, formId }) {
    RH.fillSelect('dep', DEPS, null);
    RH.fillSelect('cargo', CARGOS, null);
    wirePhoto();
    wireMasks();
    wireCep();
    wireSteps();

    const form = $(formId);
    let funcionario = null;

    if (mode === 'editar') {
      try { funcionario = JSON.parse(localStorage.getItem('editingFuncionario')); } catch { /* noop */ }
      if (!funcionario) {
        alert('Nenhum funcionário selecionado para edição.');
        window.location.href = 'funcionarios.html';
        return;
      }
      prefill(funcionario);
      $('editar-subtitulo').textContent = `Atualizando os dados de ${funcionario.nome || 'funcionário'}.`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;
      save(collectData(funcionario?.id), mode === 'editar');
    });

    const cancel = () => {
      if (mode === 'editar') {
        if (confirm('Cancelar edição e voltar para a lista?')) {
          localStorage.removeItem('editingFuncionario');
          window.location.href = 'funcionarios.html';
        }
      } else if (confirm('Cancelar cadastro e limpar o formulário?')) {
        form.reset();
        if ($('photo-preview')) $('photo-preview').src = '../assets/images/avatar-placeholder.png';
        form.querySelectorAll('.is-invalid').forEach(clearInvalid);
      }
    };

    $('btn-cancel')?.addEventListener('click', cancel);
    $('btn-cancel-2')?.addEventListener('click', cancel);
  }

  return { init };
})();
