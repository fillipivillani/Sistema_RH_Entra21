/**
 * Cliente HTTP simples para integração com o backend.
 * Altere useMock para false quando o backend estiver rodando.
 */
const API = {
  baseUrl: 'http://localhost:8080/api/v1',
  useMock: true,

  async request(method, path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Erro ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
  },

  departamentos: {
    _mock: [
      { id: 1, nome: 'Tecnologia da Informação', descricao: 'Desenvolvimento de sistemas', ativo: true },
      { id: 2, nome: 'Recursos Humanos', descricao: 'Gestão de pessoal', ativo: true },
      { id: 3, nome: 'Marketing', descricao: 'Divulgação de marca', ativo: true },
    ],

    async listar() {
      if (API.useMock) return [...this._mock];
      return API.request('GET', '/departamento/buscarTodos');
    },

    async criar(dados) {
      if (API.useMock) {
        const novo = { id: Date.now(), ...dados, ativo: true };
        this._mock.push(novo);
        return novo;
      }
      return API.request('POST', '/departamento/criarDepartamento', dados);
    },

    async deletar(id) {
      if (API.useMock) {
        const i = this._mock.findIndex((d) => d.id === id);
        if (i >= 0) this._mock.splice(i, 1);
        return;
      }
      return API.request('DELETE', `/departamento/deletarDepartamento/${id}`);
    },
  },
};
