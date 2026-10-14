/** Cliente HTTP do backend Spring (Sistema RH) */
const API = {
  baseUrl: 'http://localhost:8080/api/v1',

  async request(method, path, body) {
    let res;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em localhost:8080.');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.message || body.error || `Erro ${res.status} ao comunicar com o servidor.`);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body) { return this.request('PUT', path, body); },
  del(path) { return this.request('DELETE', path); },

  departamentos: {
    listar: () => API.get('/departamento/buscarTodos'),
    buscarPorId: (id) => API.get(`/departamento/buscarPorId/${id}`),
    criar: (dados) => API.post('/departamento/criarDepartamento', dados),
    atualizar: (id, dados) => API.put(`/departamento/editarDepartamento/${id}`, dados),
    deletar: (id) => API.del(`/departamento/deletarDepartamento/${id}`),
  },

  cargos: {
    listar: () => API.get('/cargo/buscarTodos'),
    buscarPorId: (id) => API.get(`/cargo/buscarPorId/${id}`),
    criar: (dados) => API.post('/cargo/cadastrarCargo', dados),
    atualizar: (id, dados) => API.put(`/cargo/editarCargo/${id}`, dados),
    deletar: (id) => API.del(`/cargo/deletarCargo/${id}`),
  },

  funcionarios: {
    listar: () => API.get('/funcionario/buscarTodos'),
    buscarPorId: (id) => API.get(`/funcionario/buscarPorId/${id}`),
    criar: (dados) => API.post('/funcionario/cadastrarFuncionario', dados),
    atualizar: (id, dados) => API.put(`/funcionario/atualizarFuncionario/${id}`, dados),
    deletar: (id) => API.del(`/funcionario/deletarFuncionario/${id}`),
  },

  escalas: {
    listar: () => API.get('/escalas'),
    criar: (dados) => API.post('/escalas', dados),
    associar: (funcionarioId, escalaId) => API.post('/escalas/associar', { funcionarioId, escalaId }),
  },

  movimentacoes: {
    historico: () => API.get('/movimentacao-funcionario/historicoMovimentacao'),
    registrar: (dados) => API.post('/movimentacao-funcionario/registroMovimentacao', dados),
  },

  // Os endpoints abaixo seguem o mesmo padrão dos demais e ainda precisam ser criados no backend.
  beneficios: {
    listar: () => API.get('/beneficio/buscarTodos'),
    criar: (dados) => API.post('/beneficio/cadastrarBeneficio', dados),
    atualizar: (id, dados) => API.put(`/beneficio/editarBeneficio/${id}`, dados),
    deletar: (id) => API.del(`/beneficio/deletarBeneficio/${id}`),
  },

  vagas: {
    listar: () => API.get('/vaga/buscarTodos'),
    criar: (dados) => API.post('/vaga/cadastrarVaga', dados),
    atualizar: (id, dados) => API.put(`/vaga/editarVaga/${id}`, dados),
    deletar: (id) => API.del(`/vaga/deletarVaga/${id}`),
  },

  candidatos: {
    listar: () => API.get('/candidato/buscarTodos'),
    criar: (dados) => API.post('/candidato/cadastrarCandidato', dados),
    atualizar: (id, dados) => API.put(`/candidato/editarCandidato/${id}`, dados),
    deletar: (id) => API.del(`/candidato/deletarCandidato/${id}`),
  },
};
