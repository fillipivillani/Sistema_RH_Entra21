document.addEventListener('DOMContentLoaded', () => {
  const ETAPAS = [
    { key: 'TRIAGEM', label: 'Triagem', icon: 'bi-inbox' },
    { key: 'ENTREVISTA_RH', label: 'Entrevista RH', icon: 'bi-mic' },
    { key: 'ENTREVISTA_GESTOR', label: 'Entrevista gestor', icon: 'bi-person-video3' },
    { key: 'PROPOSTA', label: 'Proposta', icon: 'bi-file-earmark-text' },
    { key: 'CONTRATADO', label: 'Contratado', icon: 'bi-check-circle' },
    { key: 'REPROVADO', label: 'Reprovado', icon: 'bi-x-circle' },
  ];
  const STATUS = { ABERTA: ['Aberta', 'success'], PAUSADA: ['Pausada', 'warning'], FECHADA: ['Fechada', 'danger'] };
  const PRIORIDADE = { ALTA: ['Alta', 'danger'], MEDIA: ['Média', 'warning'], BAIXA: ['Baixa', 'info'] };

  const $ = (id) => document.getElementById(id);
  const grid = $('grid');
  const estado = $('estado');
  const formVaga = $('form-vaga');
  const formCand = $('form-cand');
  const modalVaga = new bootstrap.Modal($('modal-vaga'));
  const modalCand = new bootstrap.Modal($('modal-cand'));

  let vagas = [];
  let candidatos = [];
  let departamentos = [];
  let vagaAtual = null;
  let estrelas = 0;

  const depId = (v) => v.departamento?.id ?? v.departamentoId;
  const depNome = (v) => v.departamento?.nome || departamentos.find((d) => d.id === depId(v))?.nome || '—';
  const vagaIdDe = (c) => c.vaga?.id ?? c.vagaId;
  const candsDa = (v) => candidatos.filter((c) => vagaIdDe(c) === v.id);

  RH.fillSelect('cand-etapa', ETAPAS, { value: 'key', label: 'label', first: null });

  async function carregar() {
    grid.innerHTML = RH.skeletonCards(6);
    estado.innerHTML = '';
    $('summary').textContent = 'Carregando...';
    try {
      const [vs, cs, deps] = await Promise.all([
        API.vagas.listar(), API.candidatos.listar(), API.departamentos.listar().catch(() => []),
      ]);
      vagas = vs || [];
      candidatos = cs || [];
      departamentos = (deps || []).sort(RH.byText('nome'));
      RH.fillSelect('f-dep', departamentos, { first: 'Todos os departamentos', selected: $('f-dep').value });
      renderVagas();
      if (vagaAtual) {
        vagaAtual = vagas.find((v) => v.id === vagaAtual.id) || null;
        vagaAtual ? renderKanban() : mostrar('vagas');
      }
    } catch (err) {
      grid.innerHTML = '';
      $('summary').textContent = '';
      estado.innerHTML = `<div class="panel">${err.status === 404
        ? RH.stateHtml({ icon: 'bi-cone-striped', title: 'Módulo aguardando o backend', text: 'Os endpoints de vagas (/api/v1/vaga) e candidatos (/api/v1/candidato) ainda não foram implementados na API.' })
        : RH.errorState(err.message)}</div>`;
      $('btn-retry')?.addEventListener('click', carregar);
    }
  }

  function mostrar(view) {
    $('view-vagas').hidden = view !== 'vagas';
    $('view-kanban').hidden = view !== 'kanban';
    window.scrollTo({ top: 0 });
  }

  function renderVagas() {
    const abertas = vagas.filter((v) => (v.status || 'ABERTA') === 'ABERTA').length;
    $('summary').textContent = `${RH.plural(abertas, 'vaga aberta', 'vagas abertas')} · ${RH.plural(candidatos.length, 'candidato', 'candidatos')} no total`;

    const busca = RH.normalize($('f-busca').value.trim());
    const dep = $('f-dep').value;
    const status = $('f-status').value;
    const lista = vagas.filter((v) =>
      (!busca || RH.normalize(v.titulo).includes(busca)) &&
      (!dep || String(depId(v)) === dep) &&
      (!status || (v.status || 'ABERTA') === status));

    if (!lista.length) {
      grid.innerHTML = '';
      estado.innerHTML = `<div class="panel">${vagas.length
        ? RH.stateHtml({ icon: 'bi-search', title: 'Nenhuma vaga encontrada', text: 'Ajuste os filtros.' })
        : RH.stateHtml({ icon: 'bi-person-plus', title: 'Nenhuma vaga aberta', text: 'Crie uma vaga para começar a acompanhar candidatos.', action: '<button class="btn btn-primary" data-nova><i class="bi bi-plus-lg"></i> Nova vaga</button>' })}</div>`;
      estado.querySelector('[data-nova]')?.addEventListener('click', () => abrirVaga());
      return;
    }

    estado.innerHTML = '';
    grid.innerHTML = lista.map((v) => {
      const cs = candsDa(v);
      const [sL, sT] = STATUS[v.status] || STATUS.ABERTA;
      const [pL, pT] = PRIORIDADE[v.prioridade] || PRIORIDADE.MEDIA;
      const contratados = cs.filter((c) => c.etapa === 'CONTRATADO').length;
      const posicoes = Number(v.numeroPosicoes) || 1;
      return `<div class="col-md-6 col-xl-4 fade-in"><article class="entity-card clickable" data-vaga="${v.id}" tabindex="0">
        <div class="entity-head">
          <span class="entity-icon tone-primary"><i class="bi bi-briefcase"></i></span>
          <div class="flex-grow-1">
            <h3 class="entity-title">${RH.escapeHtml(v.titulo)}</h3>
            <div class="entity-sub">${RH.escapeHtml(depNome(v))}</div>
          </div>
        </div>
        <div class="entity-body">
          <div class="d-flex gap-2 flex-wrap mb-2">${RH.badge(sL, sT)} ${RH.badge(`Prioridade ${pL.toLowerCase()}`, pT, false)}</div>
          <p class="mb-0 line-clamp-2">${v.descricao ? RH.escapeHtml(v.descricao) : '<span class="text-subtle">Sem descrição</span>'}</p>
        </div>
        <div class="px-4 pb-3">
          <div class="bar-row-head small"><span>Contratações</span><span>${contratados}/${posicoes}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, (contratados / posicoes) * 100)}%"></div></div>
        </div>
        <div class="entity-stats">
          <div class="entity-stat"><strong>${cs.length}</strong><span>Candidatos</span></div>
          <div class="entity-stat"><strong>${cs.filter((c) => !['CONTRATADO', 'REPROVADO'].includes(c.etapa)).length}</strong><span>Em processo</span></div>
        </div>
      </article></div>`;
    }).join('');
  }

  function renderKanban() {
    const v = vagaAtual;
    const [sL, sT] = STATUS[v.status] || STATUS.ABERTA;
    $('vaga-titulo').textContent = v.titulo;
    $('vaga-sub').innerHTML = `${RH.escapeHtml(depNome(v))} · ${RH.plural(Number(v.numeroPosicoes) || 1, 'posição', 'posições')} · ${RH.badge(sL, sT)}`;
    const cs = candsDa(v);
    $('kanban').innerHTML = ETAPAS.map((e) => {
      const lista = cs.filter((c) => (c.etapa || 'TRIAGEM') === e.key);
      return `<div class="kanban-col" data-etapa="${e.key}">
        <div class="kanban-head"><i class="bi ${e.icon} text-primary"></i>${e.label}<span class="count">${lista.length}</span></div>
        <div class="kanban-body">${lista.map((c) => `
          <div class="kanban-card" draggable="true" data-cand="${c.id}">
            <div class="d-flex align-items-center gap-2 mb-1">${RH.avatar(c.nome, null)}<div class="min-w-0"><div class="name">${RH.escapeHtml(c.nome)}</div>
            <div class="meta">${RH.escapeHtml(c.origem || '')}</div></div></div>
            ${c.avaliacao ? `<div class="stars">${'★'.repeat(c.avaliacao)}${'☆'.repeat(5 - c.avaliacao)}</div>` : ''}
          </div>`).join('') || '<div class="text-center text-subtle small py-3">Arraste candidatos para cá</div>'}
        </div></div>`;
    }).join('');
  }

  function abrirKanban(id) {
    vagaAtual = vagas.find((v) => String(v.id) === String(id));
    if (!vagaAtual) return;
    renderKanban();
    mostrar('kanban');
  }

  grid.addEventListener('click', (e) => { const c = e.target.closest('[data-vaga]'); if (c) abrirKanban(c.dataset.vaga); });
  grid.addEventListener('keydown', (e) => { const c = e.target.closest('[data-vaga]'); if (c && e.key === 'Enter') abrirKanban(c.dataset.vaga); });
  $('btn-voltar').addEventListener('click', () => { vagaAtual = null; renderVagas(); mostrar('vagas'); });

  // Drag and drop entre etapas
  const kanban = $('kanban');
  kanban.addEventListener('dragstart', (e) => {
    const card = e.target.closest('[data-cand]');
    if (!card) return;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', card.dataset.cand);
  });
  kanban.addEventListener('dragend', (e) => e.target.closest('[data-cand]')?.classList.remove('dragging'));
  kanban.addEventListener('dragover', (e) => {
    const col = e.target.closest('.kanban-col');
    if (!col) return;
    e.preventDefault();
    kanban.querySelectorAll('.drag-over').forEach((c) => c !== col && c.classList.remove('drag-over'));
    col.classList.add('drag-over');
  });
  kanban.addEventListener('dragleave', (e) => { if (!e.relatedTarget?.closest?.('.kanban-col')) kanban.querySelectorAll('.drag-over').forEach((c) => c.classList.remove('drag-over')); });
  kanban.addEventListener('drop', async (e) => {
    const col = e.target.closest('.kanban-col');
    if (!col) return;
    e.preventDefault();
    col.classList.remove('drag-over');
    const c = candidatos.find((x) => String(x.id) === e.dataTransfer.getData('text/plain'));
    if (!c || c.etapa === col.dataset.etapa) return;
    const anterior = c.etapa;
    c.etapa = col.dataset.etapa;
    renderKanban();
    try {
      await API.candidatos.atualizar(c.id, payloadCand(c));
    } catch (err) {
      c.etapa = anterior;
      renderKanban();
      RH.error(err.message);
    }
  });
  kanban.addEventListener('click', (e) => {
    const card = e.target.closest('[data-cand]');
    if (card) abrirCand(candidatos.find((x) => String(x.id) === card.dataset.cand));
  });

  /* ---------- vaga ---------- */

  function abrirVaga(v) {
    if (!departamentos.length) return RH.error('Cadastre um departamento antes de abrir vagas.');
    RH.resetForm(formVaga);
    RH.fillSelect('vaga-dep', departamentos, { selected: v ? depId(v) : null });
    formVaga.editId.value = v?.id ?? '';
    formVaga.titulo.value = v?.titulo || '';
    formVaga.numeroPosicoes.value = v?.numeroPosicoes || 1;
    formVaga.prioridade.value = v?.prioridade || 'MEDIA';
    formVaga.status.value = v?.status || 'ABERTA';
    formVaga.descricao.value = v?.descricao || '';
    $('modal-vaga-title').textContent = v ? 'Editar vaga' : 'Nova vaga';
    modalVaga.show();
  }

  $('btn-nova-vaga').addEventListener('click', () => abrirVaga());
  $('btn-editar-vaga').addEventListener('click', () => abrirVaga(vagaAtual));
  $('btn-excluir-vaga').addEventListener('click', () => {
    const v = vagaAtual;
    RH.confirm({
      title: 'Excluir vaga',
      message: `Excluir a vaga <strong>${RH.escapeHtml(v.titulo)}</strong>? Os candidatos vinculados também serão afetados.`,
      onConfirm: () => API.vagas.deletar(v.id),
    }).then((ok) => {
      if (!ok) return;
      vagaAtual = null;
      mostrar('vagas');
      RH.success('Vaga excluída.');
      carregar();
    });
  });

  formVaga.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError(formVaga, null);
    const dados = {
      titulo: formVaga.titulo.value.trim(),
      departamentoId: Number(formVaga.departamentoId.value) || null,
      numeroPosicoes: Math.max(1, parseInt(formVaga.numeroPosicoes.value, 10) || 1),
      prioridade: formVaga.prioridade.value,
      status: formVaga.status.value,
      descricao: formVaga.descricao.value.trim() || null,
    };
    formVaga.titulo.classList.toggle('is-invalid', !dados.titulo);
    formVaga.departamentoId.classList.toggle('is-invalid', !dados.departamentoId);
    if (!dados.titulo || !dados.departamentoId) return;

    const id = formVaga.editId.value;
    const btn = $('btn-salvar-vaga');
    RH.busy(btn, true);
    try {
      if (id) await API.vagas.atualizar(id, dados);
      else await API.vagas.criar(dados);
      modalVaga.hide();
      RH.success(id ? 'Vaga atualizada.' : `Vaga "${dados.titulo}" criada.`);
      await carregar();
    } catch (err) {
      RH.formError(formVaga, err.message);
    } finally {
      RH.busy(btn, false);
    }
  });

  /* ---------- candidato ---------- */

  function setEstrelas(n) {
    estrelas = n;
    document.querySelectorAll('#star-input i').forEach((s) => s.classList.toggle('on', Number(s.dataset.star) <= n));
  }
  document.querySelectorAll('#star-input i').forEach((s) =>
    s.addEventListener('click', () => setEstrelas(estrelas === Number(s.dataset.star) ? 0 : Number(s.dataset.star))));
  RH.mask(formCand.telefone, RH.maskPhone);

  function payloadCand(c) {
    return {
      vagaId: vagaIdDe(c), nome: c.nome, email: c.email || null, telefone: c.telefone || null,
      origem: c.origem || null, etapa: c.etapa, avaliacao: c.avaliacao || 0, observacoes: c.observacoes || null,
    };
  }

  function abrirCand(c) {
    RH.resetForm(formCand);
    formCand.editId.value = c?.id ?? '';
    formCand.nome.value = c?.nome || '';
    formCand.email.value = c?.email || '';
    formCand.telefone.value = RH.maskPhone(c?.telefone || '');
    formCand.origem.value = c?.origem || 'LinkedIn';
    formCand.etapa.value = c?.etapa || 'TRIAGEM';
    formCand.observacoes.value = c?.observacoes || '';
    setEstrelas(c?.avaliacao || 0);
    $('btn-excluir-cand').classList.toggle('d-none', !c);
    $('modal-cand-title').textContent = c ? 'Editar candidato' : 'Novo candidato';
    modalCand.show();
  }

  $('btn-novo-cand').addEventListener('click', () => abrirCand());
  $('btn-excluir-cand').addEventListener('click', () => {
    const c = candidatos.find((x) => String(x.id) === formCand.editId.value);
    if (!c) return;
    modalCand.hide();
    RH.confirm({
      title: 'Remover candidato',
      message: `Remover <strong>${RH.escapeHtml(c.nome)}</strong> desta vaga?`,
      confirmText: 'Remover',
      onConfirm: () => API.candidatos.deletar(c.id),
    }).then((ok) => {
      if (!ok) return;
      candidatos = candidatos.filter((x) => x.id !== c.id);
      renderKanban();
      RH.success(`${c.nome} removido(a).`);
    });
  });

  formCand.addEventListener('submit', async (e) => {
    e.preventDefault();
    RH.formError(formCand, null);
    const nome = formCand.nome.value.trim();
    formCand.nome.classList.toggle('is-invalid', !nome);
    if (!nome) return;
    const dados = payloadCand({
      vagaId: vagaAtual.id, nome,
      email: formCand.email.value.trim(), telefone: RH.onlyDigits(formCand.telefone.value),
      origem: formCand.origem.value, etapa: formCand.etapa.value, avaliacao: estrelas,
      observacoes: formCand.observacoes.value.trim(),
    });
    const id = formCand.editId.value;
    const btn = $('btn-salvar-cand');
    RH.busy(btn, true);
    try {
      if (id) await API.candidatos.atualizar(id, dados);
      else await API.candidatos.criar(dados);
      modalCand.hide();
      RH.success(id ? 'Candidato atualizado.' : `${nome} adicionado(a) à vaga.`);
      await carregar();
    } catch (err) {
      RH.formError(formCand, err.message);
    } finally {
      RH.busy(btn, false);
    }
  });

  $('f-busca').addEventListener('input', RH.debounce(renderVagas, 200));
  ['f-dep', 'f-status'].forEach((id) => $(id).addEventListener('change', renderVagas));
  $('filters').addEventListener('submit', (e) => e.preventDefault());

  carregar();
});
