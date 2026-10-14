document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const grid = $('grid');
  const estado = $('estado');
  const formEscala = $('form-escala');
  const formAssoc = $('form-associar');
  const modalEscala = new bootstrap.Modal($('modal-escala'));
  const modalAssoc = new bootstrap.Modal($('modal-associar'));

  let escalas = [];
  let funcionarios = [];

  const minutos = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + m; };

  function duracao(ini, fim) {
    if (!ini || !fim) return '';
    let d = minutos(fim) - minutos(ini);
    if (d <= 0) d += 24 * 60;
    const h = Math.floor(d / 60), m = d % 60;
    return `${h}h${m ? String(m).padStart(2, '0') : ''}`;
  }

  function periodo(ini) {
    const h = minutos(ini) / 60;
    if (h >= 5 && h < 12) return { label: 'Manhã', icon: 'bi-sunrise', tone: 'warning' };
    if (h >= 12 && h < 18) return { label: 'Tarde', icon: 'bi-sun', tone: 'info' };
    return { label: 'Noite', icon: 'bi-moon-stars', tone: 'primary' };
  }

  async function carregar() {
    grid.innerHTML = RH.skeletonCards(6);
    estado.innerHTML = '';
    $('summary').textContent = 'Carregando...';
    try {
      const [escs, funcs] = await Promise.all([API.escalas.listar(), API.funcionarios.listar().catch(() => [])]);
      escalas = (escs || []).sort((a, b) => minutos(a.horarioInicio) - minutos(b.horarioInicio));
      funcionarios = (funcs || []).filter((f) => f.status !== false).sort(RH.byText('nome'));
      render();
    } catch (err) {
      grid.innerHTML = '';
      $('summary').textContent = '';
      estado.innerHTML = `<div class="panel">${RH.errorState(err.message)}</div>`;
      $('btn-retry').onclick = carregar;
    }
  }

  function render() {
    $('summary').textContent = RH.plural(escalas.length, 'escala cadastrada', 'escalas cadastradas');
    if (!escalas.length) {
      grid.innerHTML = '';
      estado.innerHTML = `<div class="panel">${RH.stateHtml({
        icon: 'bi-calendar-week', title: 'Nenhuma escala cadastrada',
        text: 'Crie escalas para organizar os turnos de trabalho da equipe.',
        action: '<button class="btn btn-primary" data-nova><i class="bi bi-plus-lg"></i> Nova escala</button>',
      })}</div>`;
      estado.querySelector('[data-nova]').addEventListener('click', abrirNova);
      return;
    }
    estado.innerHTML = '';
    grid.innerHTML = escalas.map((e) => {
      const p = periodo(e.horarioInicio);
      return `<div class="col-md-6 col-xl-4 fade-in"><article class="entity-card">
        <div class="entity-head">
          <span class="entity-icon tone-${p.tone}"><i class="bi ${p.icon}"></i></span>
          <div class="flex-grow-1">
            <h3 class="entity-title">${RH.escapeHtml(e.nome)}</h3>
            <div class="entity-sub">${p.label}</div>
          </div>
        </div>
        <div class="entity-body"><p class="mb-0 line-clamp-2">${e.descricao ? RH.escapeHtml(e.descricao) : '<span class="text-subtle">Sem descrição</span>'}</p></div>
        <div class="entity-stats">
          <div class="entity-stat"><strong>${RH.formatTime(e.horarioInicio)}</strong><span>Entrada</span></div>
          <div class="entity-stat"><strong>${RH.formatTime(e.horarioFim)}</strong><span>Saída</span></div>
          <div class="entity-stat"><strong>${duracao(e.horarioInicio, e.horarioFim)}</strong><span>Jornada</span></div>
        </div>
        <div class="entity-foot">
          <button class="btn btn-sm btn-soft" data-associar="${e.id}"><i class="bi bi-person-check"></i> Associar funcionário</button>
        </div>
      </article></div>`;
    }).join('');
  }

  function abrirNova() {
    RH.resetForm(formEscala);
    $('esc-duracao').textContent = '';
    modalEscala.show();
  }

  function abrirAssociar(escalaId) {
    if (!escalas.length) return RH.error('Cadastre uma escala primeiro.');
    if (!funcionarios.length) return RH.error('Não há funcionários ativos para associar.');
    RH.resetForm(formAssoc);
    RH.fillSelect('assoc-escala', escalas, { label: (e) => `${e.nome} (${RH.formatTime(e.horarioInicio)}–${RH.formatTime(e.horarioFim)})`, selected: escalaId });
    RH.fillSelect('assoc-func', funcionarios, { label: (f) => `${f.nome} — ${f.cargo?.nome || 'sem cargo'}` });
    modalAssoc.show();
  }

  $('btn-nova').addEventListener('click', abrirNova);
  $('btn-associar').addEventListener('click', () => abrirAssociar());
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-associar]');
    if (b) abrirAssociar(b.dataset.associar);
  });
  $('modal-escala').addEventListener('shown.bs.modal', () => formEscala.nome.focus());

  ['esc-inicio', 'esc-fim'].forEach((id) => $(id).addEventListener('input', () => {
    const d = duracao($('esc-inicio').value, $('esc-fim').value);
    $('esc-duracao').textContent = d ? `Jornada de ${d}${minutos($('esc-fim').value) <= minutos($('esc-inicio').value) ? ' (vira o dia)' : ''}` : '';
  }));

  formEscala.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError(formEscala, null);
    const dados = {
      nome: formEscala.nome.value.trim(),
      descricao: formEscala.descricao.value.trim() || null,
      horarioInicio: formEscala.horarioInicio.value,
      horarioFim: formEscala.horarioFim.value,
    };
    let ok = true;
    [['nome', dados.nome], ['horarioInicio', dados.horarioInicio], ['horarioFim', dados.horarioFim]].forEach(([k, v]) => {
      formEscala[k].classList.toggle('is-invalid', !v);
      if (!v) ok = false;
    });
    if (!ok) return;

    const btn = $('btn-salvar-escala');
    RH.busy(btn, true);
    try {
      await API.escalas.criar(dados);
      modalEscala.hide();
      RH.success(`Escala "${dados.nome}" criada.`);
      await carregar();
    } catch (err) {
      RH.formError(formEscala, err.message);
    } finally {
      RH.busy(btn, false);
    }
  });

  formAssoc.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError(formAssoc, null);
    const escalaId = formAssoc.escalaId.value;
    const funcionarioId = formAssoc.funcionarioId.value;
    formAssoc.escalaId.classList.toggle('is-invalid', !escalaId);
    formAssoc.funcionarioId.classList.toggle('is-invalid', !funcionarioId);
    if (!escalaId || !funcionarioId) return;

    const btn = $('btn-salvar-assoc');
    RH.busy(btn, true, 'Associando...');
    try {
      await API.escalas.associar(Number(funcionarioId), Number(escalaId));
      modalAssoc.hide();
      const f = funcionarios.find((x) => String(x.id) === funcionarioId);
      const esc = escalas.find((x) => String(x.id) === escalaId);
      RH.success(`${f?.nome || 'Funcionário'} associado(a) à escala ${esc?.nome || ''}.`);
    } catch (err) {
      RH.formError(formAssoc, err.message);
    } finally {
      RH.busy(btn, false);
    }
  });

  carregar();
});
