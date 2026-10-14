/** Cadastro e edição de funcionário (edição via ?id=) */
document.addEventListener('DOMContentLoaded', async () => {
  const $ = (id) => document.getElementById(id);
  const form = $('form-funcionario');
  const id = RH.param('id');
  let departamentos = [];
  let cargos = [];

  RH.mask($('cpf'), RH.maskCPF);
  RH.mask($('telefone'), RH.maskPhone);
  RH.mask($('cep'), RH.maskCEP);

  function preview() {
    const nome = $('nome').value.trim();
    $('preview-avatar').innerHTML = RH.avatar(nome || '?', $('foto').value.trim(), 'avatar-xl');
    $('preview-nome').textContent = nome || (id ? 'Funcionário' : 'Novo funcionário');
    const cargo = cargos.find((c) => String(c.id) === $('cargoId').value)?.nome || 'Cargo';
    const dep = departamentos.find((d) => String(d.id) === $('departamentoId').value)?.nome || 'Departamento';
    $('preview-cargo').textContent = `${cargo} · ${dep}`;
  }

  function preencherCargos(selected) {
    const depId = $('departamentoId').value;
    const lista = depId ? cargos.filter((c) => String(c.departamento?.id) === depId) : cargos;
    RH.fillSelect('cargoId', lista, {
      first: lista.length ? 'Selecione' : 'Nenhum cargo neste departamento',
      label: (c) => (depId ? c.nome : `${c.nome} — ${c.departamento?.nome || ''}`),
      selected,
    });
  }

  $('departamentoId').addEventListener('change', () => { preencherCargos($('cargoId').value); preview(); });
  $('cargoId').addEventListener('change', () => {
    const c = cargos.find((x) => String(x.id) === $('cargoId').value);
    if (c?.departamento && !$('departamentoId').value) {
      $('departamentoId').value = c.departamento.id;
      preencherCargos(c.id);
    }
    preview();
  });
  ['nome', 'foto'].forEach((k) => $(k).addEventListener('input', RH.debounce(preview, 150)));

  async function buscarCep() {
    const cep = RH.onlyDigits($('cep').value);
    const status = $('cep-status');
    status.classList.remove('text-danger');
    if (cep.length !== 8) { status.textContent = 'Informe um CEP com 8 dígitos.'; status.classList.add('text-danger'); return; }
    status.textContent = 'Buscando endereço...';
    try {
      const d = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((r) => r.json());
      if (d.erro) throw new Error('CEP não encontrado.');
      $('endereco').value = [d.logradouro, d.bairro, `${d.localidade}/${d.uf}`].filter(Boolean).join(' - ');
      status.textContent = 'Endereço encontrado — complete com o número.';
      $('endereco').focus();
    } catch (err) {
      status.textContent = err.message === 'CEP não encontrado.' ? err.message : 'Não foi possível consultar o CEP.';
      status.classList.add('text-danger');
    }
  }
  $('btn-cep').addEventListener('click', buscarCep);
  $('cep').addEventListener('blur', () => { if (RH.onlyDigits($('cep').value).length === 8) buscarCep(); });

  function validar() {
    const v = (k) => $(k).value.trim();
    const regras = [
      ['nome', !v('nome')],
      ['cpf', !RH.isValidCPF(v('cpf'))],
      ['dataNascimento', !v('dataNascimento')],
      ['email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))],
      ['telefone', v('telefone') && RH.onlyDigits(v('telefone')).length < 10],
      ['departamentoId', !v('departamentoId')],
      ['cargoId', !v('cargoId')],
      ['dataAdmissao', !v('dataAdmissao')],
      ['salario', !(Number(v('salario')) > 0)],
    ];
    let primeiro = null;
    regras.forEach(([k, invalido]) => {
      $(k).classList.toggle('is-invalid', !!invalido);
      if (invalido && !primeiro) primeiro = $(k);
    });
    primeiro?.focus();
    return !primeiro;
  }

  form.querySelectorAll('input, select').forEach((el) => el.addEventListener('change', () => el.classList.remove('is-invalid')));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError($('estado'), null);
    if (!validar()) return;

    const v = (k) => $(k).value.trim();
    const dados = {
      nome: v('nome'),
      cpf: RH.onlyDigits(v('cpf')),
      rg: v('rg') || null,
      dataNascimento: v('dataNascimento'),
      telefone: RH.onlyDigits(v('telefone')) || null,
      email: v('email'),
      endereco: v('endereco') || null,
      dataAdmissao: v('dataAdmissao'),
      salario: Number(v('salario')),
      foto: v('foto') || null,
      cargoId: Number(v('cargoId')),
      departamentoId: Number(v('departamentoId')),
    };

    const btn = $('btn-salvar');
    RH.busy(btn, true);
    try {
      if (id) await API.funcionarios.atualizar(id, dados);
      else await API.funcionarios.criar(dados);
      sessionStorage.setItem('rh-flash', id ? 'Alterações salvas com sucesso.' : `${dados.nome} foi cadastrado(a).`);
      location.href = 'funcionarios.html';
    } catch (err) {
      RH.busy(btn, false);
      RH.formError($('estado'), err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  async function carregar() {
    $('estado').innerHTML = `<div class="panel">${RH.stateHtml({ icon: 'bi-hourglass-split', title: 'Carregando formulário...' })}</div>`;
    form.hidden = true;
    try {
      const [deps, cgs, func] = await Promise.all([
        API.departamentos.listar(), API.cargos.listar(), id ? API.funcionarios.buscarPorId(id) : null,
      ]);
      departamentos = (deps || []).sort(RH.byText('nome'));
      cargos = (cgs || []).sort(RH.byText('nome'));
      RH.fillSelect('departamentoId', departamentos);

      if (!departamentos.length || !cargos.length) {
        $('estado').innerHTML = `<div class="panel">${RH.stateHtml({
          icon: 'bi-diagram-3', title: 'Cadastre a estrutura primeiro',
          text: 'Para cadastrar funcionários é necessário ter ao menos um departamento e um cargo.',
          action: `<div class="d-flex gap-2"><a href="departamentos.html" class="btn btn-soft">Departamentos</a><a href="cargos.html" class="btn btn-primary">Cargos</a></div>`,
        })}</div>`;
        return;
      }

      if (func) {
        document.title = `Editar ${func.nome} · Sistema RH`;
        $('titulo').textContent = 'Editar funcionário';
        $('subtitulo').textContent = `Atualizando os dados de ${func.nome}.`;
        ['nome', 'rg', 'email', 'endereco', 'dataNascimento', 'dataAdmissao', 'foto'].forEach((k) => { $(k).value = func[k] ?? ''; });
        $('cpf').value = RH.maskCPF(func.cpf);
        $('telefone').value = RH.maskPhone(func.telefone);
        $('salario').value = func.salario ?? '';
        $('departamentoId').value = func.departamento?.id ?? '';
        $('btn-salvar').innerHTML = '<i class="bi bi-check2"></i> Salvar alterações';
      }
      preencherCargos(func?.cargo?.id);
      if (!func) $('dataAdmissao').value = new Date().toISOString().slice(0, 10);
      preview();
      $('estado').innerHTML = '';
      form.hidden = false;
      $('nome').focus();
    } catch (err) {
      $('estado').innerHTML = `<div class="panel">${RH.errorState(err.message)}</div>`;
      $('btn-retry').onclick = carregar;
    }
  }

  carregar();
});
