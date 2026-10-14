# Frontend

Interface estática com HTML, Bootstrap 5, Bootstrap Icons e JavaScript puro. Todos os dados vêm da API do backend (sem mocks).

## Estrutura

```
frontend/
├── index.html                 # Redireciona para pages/inicio.html
├── pages/
│   ├── inicio.html            # Dashboard
│   ├── funcionarios.html      # Lista + detalhes
│   ├── funcionario-form.html  # Cadastro / edição (?id=)
│   ├── movimentacoes.html     # Histórico e registro de movimentações
│   ├── escalas.html           # Escalas e associação de funcionários
│   ├── beneficios.html        # Benefícios (aguardando endpoints no backend)
│   ├── recrutamento.html      # Vagas + kanban de candidatos (aguardando endpoints)
│   ├── departamentos.html
│   └── cargos.html
├── components/
│   └── layout.js              # Sidebar, topbar, tema claro/escuro e status da API
└── assets/
    ├── css/app.css            # Design system único
    └── js/
        ├── api.js             # Cliente HTTP + endpoints
        ├── utils.js           # Helpers (formatação, toasts, confirmação, máscaras...)
        └── <pagina>.js        # Script de cada página
```

## Executar

```bash
cd frontend
npm install
npm run dev
```

O backend deve estar rodando em `http://localhost:8080` (altere `baseUrl` em `assets/js/api.js` se necessário). A origem do frontend (`http://localhost:5500`) precisa estar em `app.cors.allowed-origins`.

## Endpoints pendentes no backend

As telas de **Benefícios** e **Recrutamento** já consomem a API seguindo o mesmo padrão dos demais módulos. Enquanto os endpoints não existirem, elas exibem o aviso "Módulo aguardando o backend".

| Recurso     | Endpoints esperados |
|-------------|---------------------|
| Benefício   | `GET /api/v1/beneficio/buscarTodos`, `POST /cadastrarBeneficio`, `PUT /editarBeneficio/{id}`, `DELETE /deletarBeneficio/{id}` |
| Vaga        | `GET /api/v1/vaga/buscarTodos`, `POST /cadastrarVaga`, `PUT /editarVaga/{id}`, `DELETE /deletarVaga/{id}` |
| Candidato   | `GET /api/v1/candidato/buscarTodos`, `POST /cadastrarCandidato`, `PUT /editarCandidato/{id}`, `DELETE /deletarCandidato/{id}` |
