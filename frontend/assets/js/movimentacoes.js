document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const timeline = $('timeline');
  const estado = $('estado');
  const form = $('form-mov');
  const modal = new bootstrap.Modal($('modal-mov'));

  let historico = [];
  let funcionarios = [];
  let departamentos = [];
  let cargos = [];

  // O histórico vem com salários no formato "R$1234.50"
  const valor = (s) => Number(String(s ?? '').replace(/[^\d.-]/g, '')) || 0;

  const tipos = (m) => ({
    cargo: (m.cargoAnterior || '') !== (m.cargoNovo || ''),
    dep: (m.departamentoAnterior || '') !== (m.departamentoNovo || ''),
    sal: valor(m.salarioAnterior) !== valor(m.salarioNovo),
  });

  async function carregar() {
    timeline.innerHTML = '';
    estado.innerHTML = RH.stateHtml({ icon: 'bi-hourglass-split', title: 'Carregando histórico...' });
    $('summary').textContent = 'Carregando...';
    try {
      const [hist, funcs, deps, cgs] = await Promise.all([
        API.movimentacoes.historico(), API.funcionarios.listar(), API.departamentos.listar(), API.cargos.listar(),
      ]);
      historico = (hist || []).sort((a, b) => (b.dataMovimentacao || '').localeCompare(a.dataMovimentacao || ''));
      funcionarios = (funcs || []).sort(RH.byText('nome'));
      departamentos = (deps || []).sort(RH.byText('nome'));
      cargos = (cgs || []).sort(RH.byText('nome'));
      render();

      const pre = RH.param('funcionario');
      if (pre && funcionarios.some((f) => String(f.id) === pre)) {
        history.replaceState(null, '', location.pathname);
        abrir(pre);
      }
    } catch (err) {
      $('summary').textContent = '';
      estado.innerHTML = RH.errorState(err.message);
      $('btn-retry').onclick = carregar;
    }
  }

  function render() {
    const cont = { cargo: 0, dep: 0, sal: 0 };
    historico.forEach((m) => { const t = tipos(m); Object.keys(cont).forEach((k) => { if (t[k]) cont[k]++; }); });
    $('k-cargo').textContent = cont.cargo;
    $('k-dep').textContent = cont.dep;
    $('k-sal').textContent = cont.sal;
    $('summary').textContent = RH.plural(historico.length, 'movimentação registrada', 'movimentações registradas');

    const busca = RH.normalize($('f-busca').value.trim());
    const tipo = $('f-tipo').value;
    const lista = historico.filter((m) => (!busca || RH.normalize(m.nomeFuncionario).includes(busca)) && (!tipo || tipos(m)[tipo]));

    if (!lista.length) {
      timeline.innerHTML = '';
      estado.innerHTML = historico.length
        ? RH.stateHtml({ icon: 'bi-search', title: 'Nenhum resultado', text: 'Nenhuma movimentação corresponde aos filtros.' })
        : RH.stateHtml({ icon: 'bi-arrow-left-right', title: 'Nenhuma movimentação registrada', text: 'Promoções, transferências e reajustes aparecerão aqui.' });
      return;
    }
    estado.innerHTML = '';

    const change = (icon, de, para) => `<span class="change"><i class="bi ${icon}"></i><span class="from">${RH.escapeHtml(de || '—')}</span><i class="bi bi-arrow-right"></i><span class="to">${RH.escapeHtml(para || '—')}</span></span>`;

    timeline.innerHTML = lista.map((m) => {
      const t = tipos(m);
      const subiu = valor(m.salarioNovo) > valor(m.salarioAnterior);
      const [titulo, tone, icon] = t.cargo ? ['Mudança de cargo', 'success', 'bi-graph-up-arrow']
        : t.dep ? ['Transferência', 'info', 'bi-arrow-left-right']
        : t.sal ? ['Reajuste salarial', 'warning', 'bi-cash-coin']
        : ['Movimentação', 'primary', 'bi-clipboard-check'];
      const pct = valor(m.salarioAnterior) ? ((valor(m.salarioNovo) / valor(m.salarioAnterior) - 1) * 100) : 0;
      return `<li class="timeline-item fade-in">
        <span class="timeline-dot tone-${tone}"><i class="bi ${icon}"></i></span>
        <div class="timeline-body">
          <div class="d-flex justify-content-between gap-2 flex-wrap">
            <div class="timeline-title">${RH.escapeHtml(m.nomeFuncionario)} <span class="text-muted fw-normal">· ${titulo}</span></div>
            <span class="timeline-date"><i class="bi bi-clock me-1"></i>${RH.formatDateTime(m.dataMovimentacao)}</span>
          </div>
          <div class="change-grid">
            ${t.cargo ? change('bi-briefcase', m.cargoAnterior, m.cargoNovo) : `<span class="chip"><i class="bi bi-briefcase"></i>${RH.escapeHtml(m.cargoNovo || '—')}</span>`}
            ${t.dep ? change('bi-building', m.departamentoAnterior, m.departamentoNovo) : `<span class="chip"><i class="bi bi-building"></i>${RH.escapeHtml(m.departamentoNovo || '—')}</span>`}
            ${t.sal ? `${change('bi-cash', RH.formatCurrency(valor(m.salarioAnterior)), RH.formatCurrency(valor(m.salarioNovo)))}
              ${RH.badge(`${subiu ? '+' : ''}${pct.toFixed(1).replace('.', ',')}%`, subiu ? 'success' : 'danger', false)}` : ''}
          </div>
          ${m.observacao ? `<p class="text-muted small mb-0 mt-2"><i class="bi bi-chat-left-text me-1"></i>${RH.escapeHtml(m.observacao)}</p>` : ''}
        </div>
      </li>`;
    }).join('');
  }

  function preencherCargos(selected) {
    const dep = $('mov-dep').value;
    const lista = dep ? cargos.filter((c) => String(c.departamento?.id) === dep) : cargos;
    RH.fillSelect('mov-cargo', lista, { first: lista.length ? 'Selecione' : 'Nenhum cargo neste departamento', selected });
  }

  function atualizarFuncionario() {
    const f = funcionarios.find((x) => String(x.id) === $('mov-func').value);
    $('mov-atual').hidden = !f;
    if (!f) return;
    $('mov-atual-body').innerHTML = `
      <span class="chip"><i class="bi bi-building"></i>${RH.escapeHtml(f.departamento?.nome || '—')}</span>
      <span class="chip"><i class="bi bi-briefcase"></i>${RH.escapeHtml(f.cargo?.nome || '—')}</span>
      <span class="chip"><i class="bi bi-cash"></i>${RH.formatCurrency(f.salario)}</span>`;
    $('mov-dep').value = f.departamento?.id ?? '';
    preencherCargos(f.cargo?.id);
    $('mov-salario').value = f.salario ?? '';
    variacao();
  }

  function variacao() {
    const f = funcionarios.find((x) => String(x.id) === $('mov-func').value);
    const novo = Number($('mov-salario').value);
    const el = $('mov-variacao');
    if (!f || !novo || !Number(f.salario)) { el.textContent = ''; return; }
    const pct = (novo / Number(f.salario) - 1) * 100;
    el.textContent = pct === 0 ? 'Sem alteração salarial' : `${pct > 0 ? '+' : ''}${pct.toFixed(1).replace('.', ',')}% em relação ao salário atual`;
  }

  function abrir(funcionarioId) {
    if (!funcionarios.length) return RH.error('Não há funcionários cadastrados.');
    RH.resetForm(form);
    RH.fillSelect('mov-func', funcionarios.filter((f) => f.status !== false), { label: (f) => `${f.nome} — ${f.cargo?.nome || ''}`, selected: funcionarioId });
    RH.fillSelect('mov-dep', departamentos);
    preencherCargos();
    $('mov-variacao').textContent = '';
    atualizarFuncionario();
    modal.show();
  }

  $('btn-nova').addEventListener('click', () => abrir());
  $('mov-func').addEventListener('change', atualizarFuncionario);
  $('mov-dep').addEventListener('change', () => preencherCargos());
  $('mov-salario').addEventListener('input', variacao);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError(form, null);
    const campos = ['funcionarioId', 'novoDepartamentoId', 'novoCargoId', 'novoSalario'];
    let ok = true;
    campos.forEach((k) => {
      const invalido = !form[k].value || (k === 'novoSalario' && !(Number(form[k].value) > 0));
      form[k].classList.toggle('is-invalid', invalido);
      if (invalido) ok = false;
    });
    if (!ok) return;

    const f = funcionarios.find((x) => String(x.id) === form.funcionarioId.value);
    const dados = {
      funcionarioId: Number(form.funcionarioId.value),
      novoDepartamentoId: Number(form.novoDepartamentoId.value),
      novoCargoId: Number(form.novoCargoId.value),
      novoSalario: Number(form.novoSalario.value),
      observacao: form.observacao.value.trim() || null,
    };
    if (f && f.departamento?.id === dados.novoDepartamentoId && f.cargo?.id === dados.novoCargoId && Number(f.salario) === dados.novoSalario) {
      RH.formError(form, 'Nenhuma alteração: altere o departamento, cargo ou salário.');
      return;
    }

    const btn = $('btn-salvar');
    RH.busy(btn, true, 'Registrando...');
    try {
      await API.movimentacoes.registrar(dados);
      modal.hide();
      RH.success(`Movimentação de ${f?.nome || 'funcionário'} registrada.`);
      await carregar();
    } catch (err) {
      RH.formError(form, err.message);
    } finally {
      RH.busy(btn, false);
    }
  });

  $('f-busca').addEventListener('input', RH.debounce(render, 200));
  $('f-tipo').addEventListener('change', render);
  $('filters').addEventListener('submit', (e) => e.preventDefault());

  carregar();
});
