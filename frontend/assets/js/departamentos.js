(function () {
  // Mock Data - Departamentos
  const MOCK_DEPARTAMENTOS = [
    {
      id: 1,
      nome: 'Tecnologia da Informação',
      descricao: 'Responsável pelo desenvolvimento e manutenção de sistemas'
    },
    {
      id: 2,
      nome: 'Recursos Humanos',
      descricao: 'Gestão de pessoal e desenvolvimento organizacional'
    },
    {
      id: 3,
      nome: 'Marketing',
      descricao: 'Estratégia e divulgação de marca'
    }
  ];

  // Mock Data - Funcionários (dados puxados da página de funcionários)
  const MOCK_FUNCIONARIOS = [
    { id: 1, nome: 'Ana Silva', cpf: '123.456.789-00', cargo: 'Analista', departamento: 'Recursos Humanos', status: 'Ativo', admissao: '2022-03-01', foto: '../assets/images/avatar-placeholder.png' },
    { id: 2, nome: 'Bruno Costa', cpf: '987.654.321-11', cargo: 'Desenvolvedor', departamento: 'Tecnologia da Informação', status: 'Ativo', admissao: '2021-11-15', foto: '../assets/images/avatar-placeholder.png' },
    { id: 3, nome: 'Carla Souza', cpf: '456.123.789-22', cargo: 'Designer', departamento: 'Marketing', status: 'Inativo', admissao: '2020-06-20', foto: '../assets/images/avatar-placeholder.png' }
  ];

  // DOM Elements
  const container = document.getElementById('departamentos-container');
  const loadingSpinner = document.getElementById('loading-spinner');
  const emptyState = document.getElementById('empty-state');
  const errorAlert = document.getElementById('error-alert');
  const errorMessage = document.getElementById('error-message');
  const formNovoDepartamento = document.getElementById('form-novo-departamento');
  const btnSalvarDepartamento = document.getElementById('btn-salvar-departamento');

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    setupEventListeners();
    loadDepartamentos();
  }

  function setupEventListeners() {
    btnSalvarDepartamento.addEventListener('click', salvarNovoDepartamento);
    formNovoDepartamento.addEventListener('submit', (e) => e.preventDefault());
    
    // Event delegation para cliques nos cards
    container.addEventListener('click', handleCardClick);
  }

  function handleCardClick(e) {
    const card = e.target.closest('.departamento-card');
    if (!card) return;

    const deptId = parseInt(card.getAttribute('data-dept-id'));
    const deptNome = card.getAttribute('data-dept-nome');
    const action = e.target.getAttribute('data-action');

    if (action === 'editar') {
      e.stopPropagation();
      editarDepartamento(deptId);
    } else if (action === 'deletar') {
      e.stopPropagation();
      deletarDepartamento(deptId);
    } else if (!e.target.closest('.btn-pequeno')) {
      // Clique no card, não em botão
      abrirModalFuncionarios(deptId, deptNome);
    }
  }

  function loadDepartamentos() {
    showLoading(true);
    hideError();

    // Simular delay de carregamento
    setTimeout(() => {
      try {
        const departamentos = MOCK_DEPARTAMENTOS;

        showLoading(false);

        if (!departamentos || departamentos.length === 0) {
          showEmptyState(true);
          return;
        }

        showEmptyState(false);
        renderDepartamentos(departamentos);
      } catch (error) {
        showLoading(false);
        showError('Erro ao carregar departamentos: ' + error.message);
        console.error(error);
      }
    }, 500);
  }

  function renderDepartamentos(departamentos) {
    container.innerHTML = '';

    departamentos.forEach(dept => {
      const card = criarCardDepartamento(dept);
      container.appendChild(card);
    });
  }

  function criarCardDepartamento(departamento) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const card = document.createElement('div');
    card.className = 'departamento-card';
    card.setAttribute('data-dept-id', departamento.id);
    card.setAttribute('data-dept-nome', departamento.nome);
    card.style.cursor = 'pointer';

    const header = document.createElement('div');
    header.className = 'departamento-header';
    header.innerHTML = `
      <div>
        <h3 class="departamento-name">${escaparHtml(departamento.nome)}</h3>
      </div>
      <div class="departamento-icon">🏢</div>
    `;

    const body = document.createElement('div');
    body.className = 'departamento-body';

    if (departamento.descricao) {
      const desc = document.createElement('p');
      desc.className = 'departamento-description';
      desc.textContent = departamento.descricao;
      body.appendChild(desc);
    }

    const funcSection = document.createElement('div');
    funcSection.className = 'funcionarios-section';

    const funcTitle = document.createElement('h5');
    funcTitle.className = 'funcionarios-title';
    funcTitle.textContent = 'Funcionários';
    funcSection.appendChild(funcTitle);

    const funcList = document.createElement('ul');
    funcList.className = 'funcionarios-list';
    funcList.id = `funcionarios-${departamento.id}`;
    funcSection.appendChild(funcList);

    body.appendChild(funcSection);

    const footer = document.createElement('div');
    footer.className = 'departamento-footer';
    
    const countDiv = document.createElement('div');
    countDiv.className = 'funcionario-count';
    countDiv.id = `count-${departamento.id}`;
    countDiv.textContent = '0 funcionários';
    
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-pequeno btn-editar';
    btnEditar.setAttribute('data-action', 'editar');
    btnEditar.textContent = 'Editar';
    
    const btnDeletar = document.createElement('button');
    btnDeletar.className = 'btn-pequeno btn-deletar';
    btnDeletar.setAttribute('data-action', 'deletar');
    btnDeletar.textContent = 'Deletar';
    
    footer.appendChild(countDiv);
    footer.appendChild(btnEditar);
    footer.appendChild(btnDeletar);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    col.appendChild(card);

    // Load funcionarios for this departamento
    carregarFuncionariosPorDepartamento(departamento.id, departamento.nome);

    return col;
  }

  function carregarFuncionariosPorDepartamento(departamentoId, departamentoNome) {
    // Usar dados mock ao invés de fazer fetch
    const funcionariosDept = MOCK_FUNCIONARIOS.filter(f => f.departamento === departamentoNome);
    renderFuncionarios(departamentoId, funcionariosDept);
  }

  function renderFuncionarios(departamentoId, funcionarios) {
    const list = document.getElementById(`funcionarios-${departamentoId}`);
    const count = document.getElementById(`count-${departamentoId}`);

    if (!list) return;

    list.innerHTML = '';

    if (!funcionarios || funcionarios.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'empty-funcionarios';
      emptyItem.textContent = 'Nenhum funcionário neste departamento';
      list.appendChild(emptyItem);
      
      if (count) {
        count.textContent = '0 funcionários';
      }
      return;
    }

    funcionarios.forEach(func => {
      const item = document.createElement('li');
      item.className = 'funcionario-item';
      item.innerHTML = `
        <span class="funcionario-icon">👤</span>
        <span class="funcionario-name">${escaparHtml(func.nome || 'Sem nome')}</span>
      `;
      list.appendChild(item);
    });

    if (count) {
      const pluralidade = funcionarios.length === 1 ? 'funcionário' : 'funcionários';
      count.textContent = `${funcionarios.length} ${pluralidade}`;
    }
  }

  function salvarNovoDepartamento() {
    const nome = document.getElementById('departamentoNome').value.trim();
    const descricao = document.getElementById('departamentoDescricao').value.trim();

    if (!nome) {
      showError('Por favor, preencha o nome do departamento');
      return;
    }

    const novoDept = {
      id: Math.max(...MOCK_DEPARTAMENTOS.map(d => d.id)) + 1,
      nome: nome,
      descricao: descricao || null
    };

    MOCK_DEPARTAMENTOS.push(novoDept);

    btnSalvarDepartamento.disabled = true;
    btnSalvarDepartamento.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    // Simular delay
    setTimeout(() => {
      // Reset form
      formNovoDepartamento.reset();
      
      // Close modal
      if (window.bootstrap && window.bootstrap.Modal) {
        const modalElement = document.getElementById('departamentoModal');
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }

      // Reload departamentos
      loadDepartamentos();

      // Reset button
      btnSalvarDepartamento.disabled = false;
      btnSalvarDepartamento.innerHTML = 'Salvar';
    }, 500);
  }

  function editarDepartamento(id) {
    alert('Funcionalidade de edição em desenvolvimento');
    // TODO: Implementar edição
  }

  function deletarDepartamento(id) {
    if (!confirm('Tem certeza que deseja deletar este departamento?')) {
      return;
    }

    const index = MOCK_DEPARTAMENTOS.findIndex(d => d.id === id);
    if (index > -1) {
      MOCK_DEPARTAMENTOS.splice(index, 1);
      loadDepartamentos();
    }
  }

  function abrirModalFuncionarios(departamentoId, departamentoNome) {
    const modalTitle = document.getElementById('funcionariosModalLabel');
    const modalList = document.getElementById('funcionarios-modal-list');
    const modalElement = document.getElementById('funcionariosModal');

    if (!modalTitle || !modalList || !modalElement) {
      console.error('Elementos do modal não encontrados');
      return;
    }

    // Update modal title
    modalTitle.textContent = `Funcionários - ${escaparHtml(departamentoNome)}`;

    // Get funcionarios for this department
    const funcionarios = MOCK_FUNCIONARIOS.filter(f => f.departamento === departamentoNome);

    // Clear and render funcionarios in modal
    modalList.innerHTML = '';

    if (!funcionarios || funcionarios.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'text-center text-muted py-5';
      emptyItem.textContent = 'Nenhum funcionário neste departamento';
      modalList.appendChild(emptyItem);
    } else {
      funcionarios.forEach(func => {
        const item = document.createElement('div');
        item.className = 'funcionario-modal-item';
        item.innerHTML = `
          <img src="${func.foto || '../assets/images/avatar-placeholder.png'}" alt="${escaparHtml(func.nome)}" class="funcionario-modal-avatar-img">
          <div class="funcionario-modal-info">
            <div class="funcionario-modal-nome">${escaparHtml(func.nome || 'Sem nome')}</div>
            <div class="funcionario-modal-cargo">${escaparHtml(func.cargo || 'Sem cargo')}</div>
            <div class="funcionario-modal-cpf">CPF: ${escaparHtml(func.cpf || 'Não informado')}</div>
          </div>
          <div class="funcionario-modal-status">
            <span class="status-badge status-${func.status.toLowerCase()}">${escaparHtml(func.status)}</span>
          </div>
        `;
        modalList.appendChild(item);
      });
    }

    // Show modal
    try {
      if (window.bootstrap && window.bootstrap.Modal) {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.error('Bootstrap não está disponível');
      }
    } catch (error) {
      console.error('Erro ao abrir modal:', error);
    }
  }

  function showLoading(show) {
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'block' : 'none';
    }
    if (container) {
      container.style.display = show ? 'none' : '';
    }
  }

  function showEmptyState(show) {
    if (emptyState) {
      emptyState.style.display = show ? 'block' : 'none';
    }
  }

  function showError(message) {
    if (errorMessage && errorAlert) {
      errorMessage.textContent = message;
      errorAlert.style.display = 'block';
      errorAlert.classList.add('show');
    }
  }

  function hideError() {
    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.classList.remove('show');
    }
  }

  function escaparHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
})();
