const VAGAS_KEY = 'vagasData';
const CAND_KEY = 'candidatosData';
const DEPS = ['RH', 'TI', 'Marketing', 'Financeiro'];
const ETAPAS = [
  { key: 'TRIAGEM', label: 'Triagem', icon: 'bi-inbox' },
  { key: 'ENTREVISTA_RH', label: 'Entrevista RH', icon: 'bi-mic' },
  { key: 'ENTREVISTA_GESTOR', label: 'Entrevista Gestor', icon: 'bi-person-video3' },
  { key: 'PROPOSTA', label: 'Proposta', icon: 'bi-file-earmark-text' },
  { key: 'CONTRATADO', label: 'Contratado', icon: 'bi-check-circle' },
  { key: 'REPROVADO', label: 'Reprovado', icon: 'bi-x-circle' },
];
const SEED_VAGAS = [
  { id: 1, titulo: 'Desenvolvedor Back-end Pleno', departamento: 'TI', prioridade: 'Alta', status: 'ABERTA', numeroPosicoes: 2, descricao: 'Node.js e bancos relacionais.' },
  { id: 2, titulo: 'Analista de Recrutamento', departamento: 'RH', prioridade: 'Média', status: 'ABERTA', numeroPosicoes: 1, descricao: 'Processos seletivos ponta a ponta.' },
  { id: 3, titulo: 'Analista de Marketing Digital', departamento: 'Marketing', prioridade: 'Média', status: 'ABERTA', numeroPosicoes: 1, descricao: 'Campanhas em mídias pagas.' },
];
const SEED_CAND = [
  { id: 1, vagaId: 1, nome: 'Rafael Nogueira', email: 'rafael.n@example.com', telefone: '(11) 98888-1010', origem: 'LinkedIn', etapa: 'TRIAGEM', avaliacao: 0, observacoes: '' },
  { id: 2, vagaId: 1, nome: 'Juliana Prado', email: 'ju.prado@example.com', telefone: '(11) 98888-1011', origem: 'Indicação', etapa: 'ENTREVISTA_RH', avaliacao: 4, observacoes: '' },
  { id: 3, vagaId: 1, nome: 'Marcos Vinícius', email: 'marcos.v@example.com', telefone: '(11) 98888-1012', origem: 'Site da Empresa', etapa: 'ENTREVISTA_GESTOR', avaliacao: 5, observacoes: '' },
  { id: 4, vagaId: 2, nome: 'Camila Duarte', email: 'camila.d@example.com', telefone: '(21) 97777-2020', origem: 'Indicação', etapa: 'TRIAGEM', avaliacao: 0, observacoes: '' },
  { id: 5, vagaId: 2, nome: 'Larissa Menezes', email: 'larissa.m@example.com', telefone: '(21) 97777-2022', origem: 'Site da Empresa', etapa: 'CONTRATADO', avaliacao: 5, observacoes: '' },
];

let vagas = RH.loadStorage(VAGAS_KEY, SEED_VAGAS);
let candidatos = RH.loadStorage(CAND_KEY, SEED_CAND);
let vagaAtualId = null, deleteCtx = null, avaliacao = 0;

document.addEventListener('DOMContentLoaded', () => {
  const modalVaga = new bootstrap.Modal(document.getElementById('modal-vaga'));
  const modalCand = new bootstrap.Modal(document.getElementById('modal-candidato'));
  const modalDel = new bootstrap.Modal(document.getElementById('modal-delete'));
  const formVaga = document.getElementById('form-vaga');
  const formCand = document.getElementById('form-candidato');

  DEPS.forEach((d) => { RH.appendSelect('filter-departamento', [d]); RH.appendSelect('input-vaga-departamento', [d]); });
  const selEtapa = document.getElementById('input-cand-etapa');
  selEtapa.innerHTML = '';
  ETAPAS.forEach((e) => { const o = document.createElement('option'); o.value = e.key; o.textContent = e.label; selEtapa.appendChild(o); });

  renderVagas();

  document.getElementById('btn-voltar-vagas').onclick = () => { vagaAtualId = null; showView('vagas'); renderVagas(); };
  document.getElementById('filters-vagas').onsubmit = (e) => e.preventDefault();
  document.getElementById('filter-busca').oninput = RH.debounce(renderVagas);
  ['filter-departamento', 'filter-status'].forEach((id) => document.getElementById(id).onchange = renderVagas);
  document.getElementById('btn-clear-vagas').onclick = () => { document.getElementById('filters-vagas').reset(); renderVagas(); };

  document.getElementById('btn-nova-vaga').onclick = () => { resetVaga(); document.getElementById('modal-vaga-title').textContent = 'Nova Vaga'; modalVaga.show(); };
  document.getElementById('btn-editar-vaga').onclick = () => {
    const v = vagas.find((x) => x.id === vagaAtualId);
    if (v) { fillVaga(v); document.getElementById('modal-vaga-title').textContent = 'Editar Vaga'; modalVaga.show(); }
  };

  formVaga.onsubmit = (e) => {
    e.preventDefault();
    const dados = { titulo: formVaga.titulo.value.trim(), departamento: formVaga.departamento.value, prioridade: formVaga.prioridade.value, status: formVaga.status.value, numeroPosicoes: parseInt(formVaga.numeroPosicoes.value, 10) || 1, descricao: formVaga.descricao.value.trim() };
    if (!dados.titulo || !dados.departamento) { formVaga.classList.add('was-validated'); return; }
    const id = formVaga.id.value ? Number(formVaga.id.value) : null;
    if (id) { const i = vagas.findIndex((v) => v.id === id); if (i >= 0) vagas[i] = { ...vagas[i], ...dados }; RH.alert('success', `Vaga "${dados.titulo}" atualizada.`); }
    else { vagas.push({ id: vagas.length ? Math.max(...vagas.map((v) => v.id)) + 1 : 1, ...dados }); RH.alert('success', `Vaga "${dados.titulo}" criada.`); }
    RH.saveStorage(VAGAS_KEY, vagas); modalVaga.hide(); vagaAtualId ? renderKanban() : renderVagas();
  };

  document.getElementById('btn-novo-candidato').onclick = () => { resetCand(); formCand.vagaId.value = vagaAtualId; document.getElementById('btn-remover-candidato').classList.add('d-none'); modalCand.show(); };
  document.querySelectorAll('#star-input .bi').forEach((s) => s.onclick = () => setStars(Number(s.dataset.star)));

  formCand.onsubmit = (e) => {
    e.preventDefault();
    const dados = { vagaId: Number(formCand.vagaId.value), nome: formCand.nome.value.trim(), email: formCand.email.value.trim(), telefone: formCand.telefone.value.trim(), origem: formCand.origem.value, etapa: formCand.etapa.value, avaliacao, observacoes: formCand.observacoes.value.trim() };
    if (!dados.nome) { document.getElementById('input-cand-nome').classList.add('is-invalid'); return; }
    const id = formCand.id.value ? Number(formCand.id.value) : null;
    if (id) { const i = candidatos.findIndex((c) => c.id === id); if (i >= 0) candidatos[i] = { ...candidatos[i], ...dados }; RH.alert('success', `Candidato "${dados.nome}" atualizado.`); }
    else { candidatos.push({ id: candidatos.length ? Math.max(...candidatos.map((c) => c.id)) + 1 : 1, ...dados }); RH.alert('success', `Candidato "${dados.nome}" adicionado.`); }
    RH.saveStorage(CAND_KEY, candidatos); modalCand.hide(); renderKanban(); renderVagas();
  };

  document.getElementById('btn-remover-candidato').onclick = () => {
    const c = candidatos.find((x) => x.id === Number(formCand.id.value));
    modalCand.hide(); openDelete('candidato', c?.id, c?.nome);
  };

  document.getElementById('btn-confirm-delete').onclick = () => {
    if (!deleteCtx) return;
    if (deleteCtx.tipo === 'vaga') {
      const v = vagas.find((x) => x.id === deleteCtx.id);
      vagas = vagas.filter((x) => x.id !== deleteCtx.id);
      candidatos = candidatos.filter((c) => c.vagaId !== deleteCtx.id);
      RH.saveStorage(VAGAS_KEY, vagas); RH.saveStorage(CAND_KEY, candidatos);
      RH.alert('success', `Vaga "${v?.titulo || ''}" excluída.`);
      vagaAtualId = null; showView('vagas'); renderVagas();
    } else {
      const c = candidatos.find((x) => x.id === deleteCtx.id);
      candidatos = candidatos.filter((x) => x.id !== deleteCtx.id);
      RH.saveStorage(CAND_KEY, candidatos);
      RH.alert('success', `${c?.nome || 'Candidato'} removido.`);
      renderKanban(); renderVagas();
    }
    deleteCtx = null; modalDel.hide();
  };

  function showView(n) {
    document.getElementById('view-vagas').hidden = n !== 'vagas';
    document.getElementById('view-kanban').hidden = n !== 'kanban';
  }

  function resetVaga() { formVaga.reset(); formVaga.id.value = ''; formVaga.numeroPosicoes.value = 1; }
  function fillVaga(v) { resetVaga(); formVaga.id.value = v.id; Object.entries(v).forEach(([k, val]) => { if (formVaga[k]) formVaga[k].value = val ?? ''; }); }

  function resetCand() {
    formCand.reset(); formCand.id.value = ''; avaliacao = 0; setStars(0);
    document.getElementById('input-cand-nome').classList.remove('is-invalid');
  }

  function fillCand(c) {
    resetCand(); formCand.id.value = c.id; formCand.vagaId.value = c.vagaId;
    ['nome', 'email', 'telefone', 'origem', 'etapa', 'observacoes'].forEach((k) => { if (formCand[k]) formCand[k].value = c[k] ?? ''; });
    setStars(c.avaliacao || 0);
  }

  function setStars(n) {
    avaliacao = n;
    document.getElementById('input-cand-avaliacao').value = n;
    document.querySelectorAll('#star-input .bi').forEach((s) => {
      const v = Number(s.dataset.star);
      s.classList.toggle('bi-star-fill', v <= n); s.classList.toggle('bi-star', v > n); s.classList.toggle('filled', v <= n);
    });
  }

  function openDelete(tipo, id, nome) {
    deleteCtx = { tipo, id };
    document.getElementById('modal-delete-title').textContent = tipo === 'vaga' ? 'Excluir vaga' : 'Remover candidato';
    document.getElementById('modal-delete-text').innerHTML = tipo === 'vaga'
      ? `Tem certeza que deseja excluir <strong>${RH.escapeHtml(nome)}</strong>? Todos os candidatos serão removidos.`
      : `Tem certeza que deseja remover <strong>${RH.escapeHtml(nome)}</strong>?`;
    modalDel.show();
  }

  function vagasFiltradas() {
    const busca = document.getElementById('filter-busca').value.trim().toLowerCase();
    const dep = document.getElementById('filter-departamento').value;
    const status = document.getElementById('filter-status').value;
    return vagas.filter((v) => (!busca || v.titulo.toLowerCase().includes(busca) || v.departamento.toLowerCase().includes(busca)) && (!dep || v.departamento === dep) && (!status || v.status === status));
  }

  function renderVagas() {
    const lista = vagasFiltradas();
    const grid = document.getElementById('vagas-grid');
    document.getElementById('vagas-summary').textContent = `${vagas.length} vaga${vagas.length === 1 ? '' : 's'} · ${candidatos.length} candidato${candidatos.length === 1 ? '' : 's'}`;
    if (!lista.length) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🧭</div><strong>Nenhuma vaga encontrada</strong><span>Ajuste os filtros ou crie uma nova vaga.</span></div>`;
      return;
    }
    grid.innerHTML = lista.map((v) => {
      const cs = candidatos.filter((c) => c.vagaId === v.id);
      return `<div class="col-md-6 col-lg-4"><div class="vaga-card" data-id="${v.id}">
        <div class="vaga-card-header"><div class="d-flex justify-content-between align-items-start">
        <span class="priority-badge priority-${v.prioridade.toLowerCase()}">${v.prioridade}</span>
        <span class="status-chip ${v.status.toLowerCase()}">${v.status.charAt(0) + v.status.slice(1).toLowerCase()}</span></div>
        <h3 class="vaga-titulo">${RH.escapeHtml(v.titulo)}</h3>
        <span class="vaga-departamento"><i class="bi bi-building"></i> ${RH.escapeHtml(v.departamento)} · ${v.numeroPosicoes} posiç${v.numeroPosicoes === 1 ? 'ão' : 'ões'}</span></div>
        <div class="vaga-card-body"><div class="vaga-stats"><span><span class="vaga-candidatos-count">${cs.length}</span> candidato${cs.length === 1 ? '' : 's'}</span></div></div></div></div>`;
    }).join('');
    grid.querySelectorAll('.vaga-card').forEach((c) => c.onclick = () => { vagaAtualId = Number(c.dataset.id); showView('kanban'); renderKanban(); });
  }

  function renderKanban() {
    const vaga = vagas.find((v) => v.id === vagaAtualId);
    if (!vaga) { showView('vagas'); renderVagas(); return; }
    document.getElementById('kanban-departamento').textContent = vaga.departamento;
    document.getElementById('kanban-titulo').textContent = vaga.titulo;
    const cs = candidatos.filter((c) => c.vagaId === vaga.id);
    document.getElementById('kanban-summary').textContent = `${cs.length} candidato${cs.length === 1 ? '' : 's'} no pipeline`;

    const board = document.getElementById('kanban-board');
    board.innerHTML = ETAPAS.map((e) => {
      const itens = cs.filter((c) => c.etapa === e.key);
      return `<div class="kanban-column col-${e.key.toLowerCase()}"><div class="kanban-column-header">
        <span class="kanban-column-title"><i class="bi ${e.icon}"></i> ${e.label}</span>
        <span class="kanban-column-count">${itens.length}</span></div>
        <div class="kanban-column-body" data-etapa="${e.key}">${itens.map(cardHtml).join('')}</div></div>`;
    }).join('');

    board.querySelectorAll('.candidate-card').forEach((card) => {
      card.draggable = true;
      card.ondragstart = () => card.classList.add('dragging');
      card.ondragend = () => card.classList.remove('dragging');
      card.onclick = () => {
        const c = candidatos.find((x) => x.id === Number(card.dataset.id));
        if (!c) return;
        fillCand(c); document.getElementById('modal-candidato-title').textContent = 'Editar Candidato';
        document.getElementById('btn-remover-candidato').classList.remove('d-none'); modalCand.show();
      };
    });

    board.querySelectorAll('.kanban-column-body').forEach((col) => {
      col.ondragover = (ev) => { ev.preventDefault(); col.classList.add('drop-hover'); };
      col.ondragleave = () => col.classList.remove('drop-hover');
      col.ondrop = (ev) => {
        ev.preventDefault(); col.classList.remove('drop-hover');
        const drag = document.querySelector('.candidate-card.dragging');
        if (!drag) return;
        const c = candidatos.find((x) => x.id === Number(drag.dataset.id));
        const etapa = col.dataset.etapa;
        if (!c || c.etapa === etapa) return;
        c.etapa = etapa; RH.saveStorage(CAND_KEY, candidatos);
        RH.alert('success', `${c.nome} movido para "${ETAPAS.find((e) => e.key === etapa)?.label}".`);
        renderKanban(); renderVagas();
      };
    });
  }

  function cardHtml(c) {
    const stars = Array.from({ length: 5 }, (_, i) => `<i class="bi ${i < c.avaliacao ? 'bi-star-fill' : 'bi-star'}"></i>`).join('');
    return `<div class="candidate-card" data-id="${c.id}"><p class="candidate-name">${RH.escapeHtml(c.nome)}</p>
      ${c.email ? `<div class="candidate-meta"><i class="bi bi-envelope"></i> ${RH.escapeHtml(c.email)}</div>` : ''}
      <div class="candidate-footer"><span class="candidate-stars">${stars}</span><span class="origin-tag">${RH.escapeHtml(c.origem || 'Outros')}</span></div></div>`;
  }
});
