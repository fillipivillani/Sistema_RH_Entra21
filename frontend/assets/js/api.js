const API = {
  baseUrl: 'https://6a7b4c308c69b3eb4a180b43.mockapi.io/api/v1',

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
    listar() { return API.request('GET', '/departamentos'); },
    buscarPorId(id) { return API.request('GET', `/departamentos/${id}`); },
    criar(dados) { return API.request('POST', '/departamentos', dados); },
    atualizar(id, dados) { return API.request('PUT', `/departamentos/${id}`, dados); },
    deletar(id) { return API.request('DELETE', `/departamentos/${id}`); },
  },

  funcionarios: {
    listar() { return API.request('GET', '/funcionarios'); },
    buscarPorId(id) { return API.request('GET', `/funcionarios/${id}`); },
    criar(dados) { return API.request('POST', '/funcionarios', dados); },
    atualizar(id, dados) { return API.request('PUT', `/funcionarios/${id}`, dados); },
    deletar(id) { return API.request('DELETE', `/funcionarios/${id}`); },
  },
};