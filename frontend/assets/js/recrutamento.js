const VAGAS_KEY = 'vagasData';
const CANDIDATOS_KEY = 'candidatosData';

const DEPARTAMENTOS = ['RH', 'TI', 'Marketing', 'Financeiro'];

const ETAPAS = [
  { key: 'TRIAGEM', label: 'Triagem', icon: 'bi-inbox' },
  { key: 'ENTREVISTA_RH', label: 'Entrevista RH', icon: 'bi-mic' },
  { key: 'ENTREVISTA_GESTOR', label: 'Entrevista Gestor', icon: 'bi-person-video3' },
  { key: 'PROPOSTA', label: 'Proposta', icon: 'bi-file-earmark-text' },
  { key: 'CONTRATADO', label: 'Contratado', icon: 'bi-check-circle' },
  { key: 'REPROVADO', label: 'Reprovado', icon: 'bi-x-circle' },
];

const SEED_VAGAS = [
  { id: 1, titulo: 'Desenvolvedor Back-end Pleno', departamento: 'TI', prioridade: 'Alta', status: 'ABERTA', numeroPosicoes: 2, descricao: 'Atuação com Node.js e bancos relacionais, squad de produto.' },
  { id: 2, titulo: 'Analista de Recrutamento', departamento: 'RH', prioridade: 'Média', status: 'ABERTA', numeroPosicoes: 1, descricao: 'Condução de processos seletivos ponta a ponta.' },
  { id: 3, titulo: 'Analista de Marketing Digital', departamento: 'Marketing', prioridade: 'Média', status: 'ABERTA', numeroPosicoes: 1, descricao: 'Gestão de campanhas em mídias pagas e redes sociais.' },
  { id: 4, titulo: 'Assistente Financeiro', departamento: 'Financeiro', prioridade: 'Baixa', status: 'PAUSADA', numeroPosicoes: 1, descricao: 'Rotinas de contas a pagar e conciliação bancária.' },
  { id: 5, titulo: 'Designer de Produto', departamento: 'Marketing', prioridade: 'Alta', status: 'ENCERRADA', numeroPosicoes: 1, descricao: 'Vaga preenchida — mantida para histórico.' },
];

const SEED_CANDIDATOS = [
  { id: 1, vagaId: 1, nome: 'Rafael Nogueira', email: 'rafael.n@example.com', telefone: '(11) 98888-1010', origem: 'LinkedIn', etapa: 'TRIAGEM', avaliacao: 0, observacoes: '' },
  { id: 2, vagaId: 1, nome: 'Juliana Prado', email: 'ju.prado@example.com', telefone: '(11) 98888-1011', origem: 'Indicação', etapa: 'ENTREVISTA_RH', avaliacao: 4, observacoes: 'Boa comunicação, experiência sólida em APIs.' },
  { id: 3, vagaId: 1, nome: 'Marcos Vinícius', email: 'marcos.v@example.com', telefone: '(11) 98888-1012', origem: 'Site da Empresa', etapa: 'ENTREVISTA_GESTOR', avaliacao: 5, observacoes: 'Muito bem avaliado pelo time técnico.' },
  { id: 4, vagaId: 1, nome: 'Patrícia Gomes', email: 'patricia.g@example.com', telefone: '(11) 98888-1013', origem: 'LinkedIn', etapa: 'PROPOSTA', avaliacao: 5, observacoes: 'Aguardando aceite da proposta.' },
  { id: 5, vagaId: 1, nome: 'Igor Fernandes', email: 'igor.f@example.com', telefone: '(11) 98888-1014', origem: 'Outros', etapa: 'REPROVADO', avaliacao: 2, observacoes: 'Perfil técnico abaixo do esperado para o nível pleno.' },
  { id: 6, vagaId: 2, nome: 'Camila Duarte', email: 'camila.d@example.com', telefone: '(21) 97777-2020', origem: 'Indicação', etapa: 'TRIAGEM', avaliacao: 0, observacoes: '' },
  { id: 7, vagaId: 2, nome: 'Thiago Barros', email: 'thiago.b@example.com', telefone: '(21) 97777-2021', origem: 'LinkedIn', etapa: 'ENTREVISTA_RH', avaliacao: 3, observacoes: '' },
  { id: 8, vagaId: 2, nome: 'Larissa Menezes', email: 'larissa.m@example.com', telefone: '(21) 97777-2022', origem: 'Site da Empresa', etapa: 'CONTRATADO', avaliacao: 5, observacoes: 'Contratada — início em 30 dias.' },
  { id: 9, vagaId: 3, nome: 'Renata Cardoso', email: 'renata.c@example.com', telefone: '(31) 96666-3030', origem: 'LinkedIn', etapa: 'TRIAGEM', avaliacao: 0, observacoes: '' },
  { id: 10, vagaId: 3, nome: 'Eduardo Lima', email: 'eduardo.l@example.com', telefone: '(31) 96666-3031', origem: 'Indicação', etapa: 'ENTREVISTA_RH', avaliacao: 4, observacoes: '' },
  { id: 11, vagaId: 3, nome: 'Bianca Ferreira', email: 'bianca.f@example.com', telefone: '(31) 96666-3032', origem: 'Outros', etapa: 'REPROVADO', avaliacao: 1, observacoes: 'Não compareceu à entrevista.' },
  { id: 12, vagaId: 4, nome: 'André Salles', email: 'andre.s@example.com', telefone: '(41) 95555-4040', origem: 'Site da Empresa', etapa: 'TRIAGEM', avaliacao: 0, observacoes: '' },
];

let vagas = [];
let candidatos = [];
let vagaAtualId = null;
let deleteContext = null; // { tipo: 'vaga' | 'candidato', id }

document.addEventListener('DOMContentLoaded', () => {
  vagas = loadVagas();
  candidatos = loadCandidatos();

  const modalVaga = new bootstrap.Modal(document.getElementById('modal-vaga'));
  const modalCandidato = new bootstrap.Modal(document.getElementById('modal-candidato'));
  const modalDelete = new bootstrap.Modal(document.getElementById('modal-delete'));

  popularSelects();
  renderVagasGrid();

  /* =========================================================
     NAVEGAÇÃO ENTRE VISÕES
     ========================================================= */
  document.getElementById('btn-voltar-vagas').addEventListener('click', () => {
    vagaAtualId = null;
    mostrarView('vagas');
    renderVagasGrid();
  });

  function mostrarView(nome) {
    document.getElementById('view-vagas').hidden = nome !== 'vagas';
    document.getElementById('view-kanban').hidden = nome !== 'kanban';
  }

  function abrirKanban(vagaId) {
    vagaAtualId = vagaId;
    mostrarView('kanban');
    renderKanban();
  }

  /* =========================================================
     FILTROS DE VAGAS
     ========================================================= */
  const filtersForm = document.getElementById('filters-vagas');
  filtersForm.addEventListener('submit', (e) => e.preventDefault());
  document.getElementById('filter-busca').addEventListener('input', debounce(renderVagasGrid, 250));
  ['filter-departamento', 'filter-status'].forEach((id) => {
    document.getElementById(id).addEventListener('change', renderVagasGrid);
  });
  document.getElementById('btn-clear-vagas').addEventListener('click', () => {
    filtersForm.reset();
    renderVagasGrid();
  });

  /* =========================================================
     VAGA: criar / editar
     ========================================================= */
  const formVaga = document.getElementById('form-vaga');
  const modalVagaTitle = document.getElementById('modal-vaga-title');
  const btnSalvarVaga = document.getElementById('btn-salvar-vaga');

  document.getElementById('btn-nova-vaga').addEventListener('click', () => {
    resetFormVaga();
    modalVagaTitle.textContent = 'Nova Vaga';
    btnSalvarVaga.textContent = 'Salvar';
    modalVaga.show();
  });

  document.getElementById('btn-editar-vaga').addEventListener('click', () => {
    const vaga = vagas.find((v) => v.id === vagaAtualId);
    if (!vaga) return;
    preencherFormVaga(vaga);
    modalVagaTitle.textContent = 'Editar Vaga';
    btnSalvarVaga.textContent = 'Salvar alterações';
    modalVaga.show();
  });

  function resetFormVaga() {
    formVaga.reset();
    formVaga.classList.remove('was-validated');
    formVaga.id.value = '';
    formVaga.numeroPosicoes.value = 1;
    hideErro('form-vaga-erro');
  }

  function preencherFormVaga(vaga) {
    resetFormVaga();
    formVaga.id.value = vaga.id;
    formVaga.titulo.value = vaga.titulo;
    formVaga.departamento.value = vaga.departamento;
    formVaga.prioridade.value = vaga.prioridade;
    formVaga.status.value = vaga.status;
    formVaga.numeroPosicoes.value = vaga.numeroPosicoes || 1;
    formVaga.descricao.value = vaga.descricao || '';
  }

  formVaga.addEventListener('submit', (e) => {
    e.preventDefault();
    hideErro('form-vaga-erro');

    const dados = {
      titulo: formVaga.titulo.value.trim(),
      departamento: formVaga.departamento.value,
      prioridade: formVaga.prioridade.value,
      status: formVaga.status.value,
      numeroPosicoes: parseInt(formVaga.numeroPosicoes.value, 10) || 1,
      descricao: formVaga.descricao.value.trim(),
    };

    let valido = true;
    if (!dados.titulo) { marcarInvalido('input-vaga-titulo'); valido = false; } else { marcarValido('input-vaga-titulo'); }
    if (!dados.departamento) { marcarInvalido('input-vaga-departamento'); valido = false; } else { marcarValido('input-vaga-departamento'); }

    if (!valido) {
      formVaga.classList.add('was-validated');
      return;
    }

    const id = formVaga.id.value ? Number(formVaga.id.value) : null;

    if (id) {
      const idx = vagas.findIndex((v) => v.id === id);
      if (idx >= 0) vagas[idx] = { ...vagas[idx], ...dados };
      mostrarAlerta('success', `Vaga "${dados.titulo}" atualizada.`);
    } else {
      const novoId = vagas.length ? Math.max(...vagas.map((v) => v.id)) + 1 : 1;
      vagas.push({ id: novoId, ...dados });
      mostrarAlerta('success', `Vaga "${dados.titulo}" criada.`);
    }

    persistVagas();
    modalVaga.hide();

    if (vagaAtualId) {
      renderKanban();
    } else {
      renderVagasGrid();
    }
  });

  /* =========================================================
     CANDIDATO: criar / editar
     ========================================================= */
  const formCandidato = document.getElementById('form-candidato');
  const modalCandidatoTitle = document.getElementById('modal-candidato-title');
  const btnRemoverCandidato = document.getElementById('btn-remover-candidato');
  let avaliacaoAtual = 0;

  document.getElementById('btn-novo-candidato').addEventListener('click', () => {
    resetFormCandidato();
    formCandidato.vagaId.value = vagaAtualId;
    modalCandidatoTitle.textContent = 'Novo Candidato';
    btnRemoverCandidato.classList.add('d-none');
    modalCandidato.show();
  });

  function resetFormCandidato() {
    formCandidato.reset();
    formCandidato.classList.remove('was-validated');
    formCandidato.id.value = '';
    hideErro('form-candidato-erro');
    setAvaliacao(0);
    ['input-cand-nome'].forEach((id) => document.getElementById(id).classList.remove('is-invalid'));
  }

  function setAvaliacao(n) {
    avaliacaoAtual = n;
    document.getElementById('input-cand-avaliacao').value = n;
    document.querySelectorAll('#star-input .bi').forEach((star) => {
      const val = Number(star.dataset.star);
      star.classList.toggle('bi-star-fill', val <= n);
      star.classList.toggle('bi-star', val > n);
      star.classList.toggle('filled', val <= n);
    });
  }

  document.querySelectorAll('#star-input .bi').forEach((star) => {
    star.addEventListener('click', () => setAvaliacao(Number(star.dataset.star)));
  });

  function preencherFormCandidato(c) {
    resetFormCandidato();
    formCandidato.id.value = c.id;
    formCandidato.vagaId.value = c.vagaId;
    formCandidato.nome.value = c.nome;
    formCandidato.email.value = c.email || '';
    formCandidato.telefone.value = c.telefone || '';
    formCandidato.origem.value = c.origem || 'LinkedIn';
    formCandidato.etapa.value = c.etapa;
    formCandidato.observacoes.value = c.observacoes || '';
    setAvaliacao(c.avaliacao || 0);
  }

  formCandidato.addEventListener('submit', (e) => {
    e.preventDefault();
    hideErro('form-candidato-erro');

    const dados = {
      vagaId: Number(formCandidato.vagaId.value),
      nome: formCandidato.nome.value.trim(),
      email: formCandidato.email.value.trim(),
      telefone: formCandidato.telefone.value.trim(),
      origem: formCandidato.origem.value,
      etapa: formCandidato.etapa.value,
      avaliacao: avaliacaoAtual,
      observacoes: formCandidato.observacoes.value.trim(),
    };

    if (!dados.nome) {
      marcarInvalido('input-cand-nome');
      formCandidato.classList.add('was-validated');
      return;
    }
    marcarValido('input-cand-nome');

    const id = formCandidato.id.value ? Number(formCandidato.id.value) : null;

    if (id) {
      const idx = candidatos.findIndex((c) => c.id === id);
      if (idx >= 0) candidatos[idx] = { ...candidatos[idx], ...dados };
      mostrarAlerta('success', `Candidato "${dados.nome}" atualizado.`);
    } else {
      const novoId = candidatos.length ? Math.max(...candidatos.map((c) => c.id)) + 1 : 1;
      candidatos.push({ id: novoId, ...dados });
      mostrarAlerta('success', `Candidato "${dados.nome}" adicionado ao pipeline.`);
    }

    persistCandidatos();
    modalCandidato.hide();
    renderKanban();
    renderVagasGrid();
  });

  btnRemoverCandidato.addEventListener('click', () => {
    const id = Number(formCandidato.id.value);
    const candidato = candidatos.find((c) => c.id === id);
    modalCandidato.hide();
    abrirConfirmDelete('candidato', id, candidato?.nome || 'este candidato');
  });

  /* =========================================================
     EXCLUSÃO (vaga ou candidato)
     ========================================================= */
  function abrirConfirmDelete(tipo, id, nome) {
    deleteContext = { tipo, id };
    document.getElementById('modal-delete-title').textContent =
      tipo === 'vaga' ? 'Excluir vaga' : 'Remover candidato';
    document.getElementById('modal-delete-text').innerHTML =
      tipo === 'vaga'
        ? `Tem certeza que deseja excluir <strong>${escapeHtml(nome)}</strong>? Todos os candidatos dessa vaga também serão removidos.`
        : `Tem certeza que deseja remover <strong>${escapeHtml(nome)}</strong> do processo seletivo?`;
    modalDelete.show();
  }

  document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (!deleteContext) return;
    const { tipo, id } = deleteContext;

    if (tipo === 'vaga') {
      const vaga = vagas.find((v) => v.id === id);
      vagas = vagas.filter((v) => v.id !== id);
      candidatos = candidatos.filter((c) => c.vagaId !== id);
      persistVagas();
      persistCandidatos();
      mostrarAlerta('success', `Vaga "${vaga?.titulo || ''}" excluída.`);
      vagaAtualId = null;
      mostrarView('vagas');
      renderVagasGrid();
    } else {
      const candidato = candidatos.find((c) => c.id === id);
      candidatos = candidatos.filter((c) => c.id !== id);
      persistCandidatos();
      mostrarAlerta('success', `${candidato?.nome || 'Candidato'} removido do pipeline.`);
      renderKanban();
      renderVagasGrid();
    }

    deleteContext = null;
    modalDelete.hide();
  });

  /* =========================================================
     RENDERIZAÇÃO: grid de vagas
     ========================================================= */
  function vagasFiltradas() {
    const busca = document.getElementById('filter-busca').value.trim().toLowerCase();
    const dep = document.getElementById('filter-departamento').value;
    const status = document.getElementById('filter-status').value;

    return vagas.filter((v) =>
      (!busca || v.titulo.toLowerCase().includes(busca) || v.departamento.toLowerCase().includes(busca)) &&
      (!dep || v.departamento === dep) &&
      (!status || v.status === status)
    );
  }

  function renderVagasGrid() {
    const lista = vagasFiltradas();
    const grid = document.getElementById('vagas-grid');
    const totalCandidatos = candidatos.length;

    document.getElementById('vagas-summary').textContent =
      `${vagas.length} vaga${vagas.length === 1 ? '' : 's'} cadastrada${vagas.length === 1 ? '' : 's'} · ${totalCandidatos} candidato${totalCandidatos === 1 ? '' : 's'} em processo`;

    if (!lista.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🧭</div>
          <strong>Nenhuma vaga encontrada</strong>
          <span>Ajuste os filtros ou crie uma nova vaga.</span>
        </div>
      `;
      return;
    }

    grid.innerHTML = lista.map((v) => {
      const candidatosVaga = candidatos.filter((c) => c.vagaId === v.id);
      const contratados = candidatosVaga.filter((c) => c.etapa === 'CONTRATADO').length;
      const emAndamento = candidatosVaga.filter((c) => !['CONTRATADO', 'REPROVADO'].includes(c.etapa)).length;

      const segs = ETAPAS.filter((e) => e.key !== 'REPROVADO').map((etapa) => {
        const preenchido = candidatosVaga.some((c) => c.etapa === etapa.key || precedeuEtapa(candidatosVaga, etapa.key));
        return `<span class="vaga-progress-seg ${preenchido ? `filled ${etapa.key === 'CONTRATADO' ? 'contratado' : ''}` : ''}"></span>`;
      }).join('');

      return `
        <div class="col-md-6 col-lg-4">
          <div class="vaga-card" data-id="${v.id}">
            <div class="vaga-card-header">
              <div class="d-flex justify-content-between align-items-start">
                <span class="priority-badge priority-${v.prioridade.toLowerCase()}">${v.prioridade}</span>
                <span class="status-chip ${v.status.toLowerCase() === 'aberta' ? 'aberta' : v.status.toLowerCase() === 'pausada' ? 'pausada' : 'encerrada'}">${capitalizar(v.status)}</span>
              </div>
              <h3 class="vaga-titulo">${escapeHtml(v.titulo)}</h3>
              <span class="vaga-departamento"><i class="bi bi-building"></i> ${escapeHtml(v.departamento)} · ${v.numeroPosicoes} posiç${v.numeroPosicoes === 1 ? 'ão' : 'ões'}</span>
            </div>
            <div class="vaga-card-body">
              <div class="vaga-progress">${segs}</div>
              <div class="vaga-stats">
                <span><span class="vaga-candidatos-count">${candidatosVaga.length}</span> candidato${candidatosVaga.length === 1 ? '' : 's'}</span>
                <span>${contratados ? `${contratados} contratado${contratados === 1 ? '' : 's'}` : `${emAndamento} em andamento`}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.vaga-card').forEach((card) => {
      card.addEventListener('click', () => abrirKanban(Number(card.dataset.id)));
    });
  }

  function precedeuEtapa(candidatosVaga, etapaKey) {
    const idxAlvo = ETAPAS.findIndex((e) => e.key === etapaKey);
    return candidatosVaga.some((c) => {
      if (c.etapa === 'REPROVADO') return false;
      const idxCand = ETAPAS.findIndex((e) => e.key === c.etapa);
      return idxCand > idxAlvo;
    });
  }

  /* =========================================================
     RENDERIZAÇÃO: kanban
     ========================================================= */
  function renderKanban() {
    const vaga = vagas.find((v) => v.id === vagaAtualId);
    if (!vaga) { mostrarView('vagas'); renderVagasGrid(); return; }

    document.getElementById('kanban-departamento').textContent = vaga.departamento;
    document.getElementById('kanban-titulo').textContent = vaga.titulo;

    const candidatosVaga = candidatos.filter((c) => c.vagaId === vaga.id);
    document.getElementById('kanban-summary').textContent =
      `${candidatosVaga.length} candidato${candidatosVaga.length === 1 ? '' : 's'} no pipeline · ${vaga.numeroPosicoes} posiç${vaga.numeroPosicoes === 1 ? 'ão' : 'ões'}`;

    const board = document.getElementById('kanban-board');
    board.innerHTML = ETAPAS.map((etapa) => {
      const itens = candidatosVaga.filter((c) => c.etapa === etapa.key);
      return `
        <div class="kanban-column col-${etapa.key.toLowerCase()}" data-etapa="${etapa.key}">
          <div class="kanban-column-header">
            <span class="kanban-column-title"><i class="bi ${etapa.icon}"></i> ${etapa.label}</span>
            <span class="kanban-column-count">${itens.length}</span>
          </div>
          <div class="kanban-column-body" data-etapa="${etapa.key}">
            ${itens.map(candidateCardHtml).join('') || ''}
          </div>
        </div>
      `;
    }).join('');

    wireDragAndDrop();

    board.querySelectorAll('.candidate-card').forEach((card) => {
      card.addEventListener('click', () => {
        const c = candidatos.find((x) => x.id === Number(card.dataset.id));
        if (!c) return;
        preencherFormCandidato(c);
        modalCandidatoTitle.textContent = 'Editar Candidato';
        btnRemoverCandidato.classList.remove('d-none');
        modalCandidato.show();
      });
    });
  }

  function candidateCardHtml(c) {
    return `
      <div class="candidate-card" draggable="true" data-id="${c.id}">
        <p class="candidate-name">${escapeHtml(c.nome)}</p>
        ${c.email ? `<div class="candidate-meta"><i class="bi bi-envelope"></i> ${escapeHtml(c.email)}</div>` : ''}
        ${c.telefone ? `<div class="candidate-meta"><i class="bi bi-telephone"></i> ${escapeHtml(c.telefone)}</div>` : ''}
        <div class="candidate-footer">
          <span class="candidate-stars">${starsHtml(c.avaliacao)}</span>
          <span class="origin-tag">${escapeHtml(c.origem || 'Outros')}</span>
        </div>
      </div>
    `;
  }

  function starsHtml(nota) {
    let html = '';
    for (let i = 1; i <= 5; i += 1) {
      html += `<i class="bi ${i <= nota ? 'bi-star-fill' : 'bi-star'}"></i>`;
    }
    return html;
  }

  /* ---------- Drag and drop (HTML5 nativo) ---------- */
  function wireDragAndDrop() {
    const cards = document.querySelectorAll('.candidate-card');
    const colunas = document.querySelectorAll('.kanban-column-body');

    cards.forEach((card) => {
      card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });

    colunas.forEach((coluna) => {
      coluna.addEventListener('dragover', (e) => {
        e.preventDefault();
        coluna.classList.add('drop-hover');
      });
      coluna.addEventListener('dragleave', () => {
        coluna.classList.remove('drop-hover');
      });
      coluna.addEventListener('drop', (e) => {
        e.preventDefault();
        coluna.classList.remove('drop-hover');
        const dragging = document.querySelector('.candidate-card.dragging');
        if (!dragging) return;

        const candidatoId = Number(dragging.dataset.id);
        const novaEtapa = coluna.dataset.etapa;
        const candidato = candidatos.find((c) => c.id === candidatoId);
        if (!candidato || candidato.etapa === novaEtapa) return;

        candidato.etapa = novaEtapa;
        persistCandidatos();
        const etapaInfo = ETAPAS.find((e) => e.key === novaEtapa);
        mostrarAlerta('success', `${candidato.nome} movido para "${etapaInfo?.label}".`);
        renderKanban();
        renderVagasGrid();
      });
    });
  }

  /* =========================================================
     Auxiliares de UI
     ========================================================= */
  function popularSelects() {
    const selects = [document.getElementById('filter-departamento'), document.getElementById('input-vaga-departamento')];
    selects.forEach((select) => {
      DEPARTAMENTOS.forEach((dep) => {
        const opt = document.createElement('option');
        opt.value = dep; opt.textContent = dep;
        select.appendChild(opt);
      });
    });

    const selectEtapa = document.getElementById('input-cand-etapa');
    ETAPAS.forEach((etapa) => {
      const opt = document.createElement('option');
      opt.value = etapa.key; opt.textContent = etapa.label;
      selectEtapa.appendChild(opt);
    });
  }

  function marcarInvalido(id) { document.getElementById(id).classList.add('is-invalid'); }
  function marcarValido(id) { document.getElementById(id).classList.remove('is-invalid'); }
  function hideErro(id) { const el = document.getElementById(id); el.hidden = true; el.textContent = ''; }

  function mostrarAlerta(tipo, mensagem) {
    const stack = document.getElementById('alert-stack');
    const el = document.createElement('div');
    el.className = `app-alert ${tipo}`;
    const icon = tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    el.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${escapeHtml(mensagem)}</span>
      <button type="button" class="btn-close" aria-label="Fechar"></button>
    `;
    el.querySelector('.btn-close').addEventListener('click', () => el.remove());
    stack.appendChild(el);
    if (tipo === 'success') setTimeout(() => el.remove(), 3500);
  }
});

/* ---------- Persistência ---------- */
function loadVagas() {
  try {
    const raw = localStorage.getItem(VAGAS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { console.warn('Não foi possível ler vagasData', e); }
  localStorage.setItem(VAGAS_KEY, JSON.stringify(SEED_VAGAS));
  return SEED_VAGAS.slice();
}

function loadCandidatos() {
  try {
    const raw = localStorage.getItem(CANDIDATOS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { console.warn('Não foi possível ler candidatosData', e); }
  localStorage.setItem(CANDIDATOS_KEY, JSON.stringify(SEED_CANDIDATOS));
  return SEED_CANDIDATOS.slice();
}

function persistVagas() {
  try { localStorage.setItem(VAGAS_KEY, JSON.stringify(vagas)); }
  catch (e) { console.error('Erro ao salvar vagas', e); }
}

function persistCandidatos() {
  try { localStorage.setItem(CANDIDATOS_KEY, JSON.stringify(candidatos)); }
  catch (e) { console.error('Erro ao salvar candidatos', e); }
}

/* ---------- Utilitários ---------- */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(str) {
  return (str ?? '').toString().replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function capitalizar(str) {
  const s = (str || '').toString().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}