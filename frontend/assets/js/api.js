const API = {
  baseUrl: 'http://localhost:8080/api/v1',
  useMock: true,

  async request(method, path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `Erro ${res.status}`);
    return res.status === 204 ? null : res.json();
  },

  departamentos: {
    _mock: [
      { id: 1, nome: 'Tecnologia da Informação', descricao: 'Desenvolvimento de sistemas', ativo: true },
      { id: 2, nome: 'Recursos Humanos', descricao: 'Gestão de pessoal', ativo: true },
      { id: 3, nome: 'Marketing', descricao: 'Divulgação de marca', ativo: true },
    ],
    listar() { return API.useMock ? [...this._mock] : API.request('GET', '/departamento/buscarTodos'); },
    criar(dados) {
      if (API.useMock) { const n = { id: Date.now(), ...dados, ativo: true }; this._mock.push(n); return n; }
      return API.request('POST', '/departamento/criarDepartamento', dados);
    },
    deletar(id) {
      if (API.useMock) { const i = this._mock.findIndex((d) => d.id === id); if (i >= 0) this._mock.splice(i, 1); return; }
      return API.request('DELETE', `/departamento/deletarDepartamento/${id}`);
    },
  },
};
