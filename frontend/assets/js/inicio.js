document.addEventListener('DOMContentLoaded', async () => {
  const hora = new Date().getHours();
  document.getElementById('hero-greeting').textContent = hora < 12 ? 'Bom dia!' : hora < 18 ? 'Boa tarde!' : 'Boa noite!';
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  document.getElementById('hero-date').textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1);

  const kpi = (k, v) => { document.querySelector(`[data-kpi="${k}"]`).textContent = v; };
  const elDeps = document.getElementById('por-departamento');
  const elAdm = document.getElementById('admissoes');
  const elMov = document.getElementById('movimentacoes');

  elAdm.innerHTML = elMov.innerHTML = Array.from({ length: 4 }, () =>
    '<li class="list-row"><span class="skeleton" style="width:40px;height:40px;border-radius:50%"></span><div class="grow"><span class="skeleton mb-2" style="height:12px;width:50%"></span><span class="skeleton" style="height:10px;width:30%"></span></div></li>').join('');

  const [funcR, depR, cargoR, movR] = await Promise.allSettled([
    API.funcionarios.listar(), API.departamentos.listar(), API.cargos.listar(), API.movimentacoes.historico(),
  ]);

  const funcionarios = funcR.status === 'fulfilled' ? funcR.value || [] : null;
  const departamentos = depR.status === 'fulfilled' ? depR.value || [] : null;
  const cargos = cargoR.status === 'fulfilled' ? cargoR.value || [] : null;
  const movs = movR.status === 'fulfilled' ? movR.value || [] : null;

  const falha = (msg) => `<li>${RH.stateHtml({ icon: 'bi-wifi-off', title: 'Dados indisponíveis', text: msg, error: true })}</li>`;

  // KPIs
  if (funcionarios) {
    const ativos = funcionarios.filter((f) => f.status !== false);
    kpi('ativos', ativos.length);
    kpi('ativos-hint', `${RH.plural(funcionarios.length, 'cadastrado', 'cadastrados')} no total`);
    const folha = ativos.reduce((s, f) => s + (Number(f.salario) || 0), 0);
    kpi('folha', RH.formatCurrency(folha));
    kpi('folha-hint', ativos.length ? `Média de ${RH.formatCurrency(folha / ativos.length)} por pessoa` : 'Sem funcionários ativos');
  } else {
    kpi('ativos', '—'); kpi('folha', '—'); kpi('ativos-hint', 'Falha ao carregar'); kpi('folha-hint', 'Falha ao carregar');
  }

  if (departamentos) {
    kpi('deps', departamentos.length);
    kpi('deps-hint', RH.plural(departamentos.filter((d) => d.ativo !== false).length, 'ativo', 'ativos'));
  } else { kpi('deps', '—'); kpi('deps-hint', 'Falha ao carregar'); }

  if (cargos) {
    kpi('cargos', cargos.length);
    kpi('cargos-hint', RH.plural(cargos.filter((c) => c.ativo !== false).length, 'ativo', 'ativos'));
  } else { kpi('cargos', '—'); kpi('cargos-hint', 'Falha ao carregar'); }

  // Funcionários por departamento
  if (!funcionarios || !departamentos) {
    elDeps.innerHTML = RH.stateHtml({ icon: 'bi-wifi-off', title: 'Dados indisponíveis', text: 'Não foi possível consultar o backend.', error: true });
  } else if (!departamentos.length) {
    elDeps.innerHTML = RH.stateHtml({ icon: 'bi-building', title: 'Nenhum departamento', text: 'Cadastre departamentos para ver a distribuição.' });
  } else {
    const contagem = departamentos.map((d) => ({
      nome: d.nome,
      total: funcionarios.filter((f) => f.departamento?.id === d.id && f.status !== false).length,
    })).sort((a, b) => b.total - a.total);
    const max = Math.max(1, ...contagem.map((c) => c.total));
    elDeps.innerHTML = `<div class="bar-list">${contagem.map((c) => `
      <div><div class="bar-row-head"><span>${RH.escapeHtml(c.nome)}</span><span>${c.total}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:0" data-w="${(c.total / max) * 100}%"></div></div></div>`).join('')}</div>`;
    requestAnimationFrame(() => elDeps.querySelectorAll('.bar-fill').forEach((b) => { b.style.width = b.dataset.w; }));
  }

  // Admissões recentes
  if (!funcionarios) elAdm.innerHTML = falha('Não foi possível carregar os funcionários.');
  else if (!funcionarios.length) elAdm.innerHTML = `<li>${RH.stateHtml({ icon: 'bi-people', title: 'Nenhum funcionário cadastrado', action: '<a href="funcionario-form.html" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Cadastrar</a>' })}</li>`;
  else {
    elAdm.innerHTML = [...funcionarios]
      .sort((a, b) => (b.dataAdmissao || '').localeCompare(a.dataAdmissao || ''))
      .slice(0, 5)
      .map((f) => `<li class="list-row">
        ${RH.avatar(f.nome, f.foto)}
        <div class="grow"><div class="title">${RH.escapeHtml(f.nome)}</div>
        <div class="meta">${RH.escapeHtml(f.cargo?.nome || '—')} · ${RH.escapeHtml(f.departamento?.nome || '—')}</div></div>
        <span class="chip"><i class="bi bi-calendar3"></i>${RH.formatDate(f.dataAdmissao)}</span>
      </li>`).join('');
  }

  // Movimentações
  if (!movs) elMov.innerHTML = falha('Não foi possível carregar o histórico.');
  else if (!movs.length) elMov.innerHTML = `<li>${RH.stateHtml({ icon: 'bi-arrow-left-right', title: 'Nenhuma movimentação registrada' })}</li>`;
  else {
    elMov.innerHTML = [...movs]
      .sort((a, b) => (b.dataMovimentacao || '').localeCompare(a.dataMovimentacao || ''))
      .slice(0, 5)
      .map((m) => `<li class="list-row">
        ${RH.avatar(m.nomeFuncionario)}
        <div class="grow"><div class="title">${RH.escapeHtml(m.nomeFuncionario)}</div>
        <div class="meta">${RH.escapeHtml(m.cargoAnterior || '—')} <i class="bi bi-arrow-right"></i> ${RH.escapeHtml(m.cargoNovo || '—')}</div></div>
        <span class="text-subtle small text-nowrap">${RH.formatDate(m.dataMovimentacao)}</span>
      </li>`).join('');
  }
});
