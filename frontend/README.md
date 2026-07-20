# Frontend

Interface estática com HTML, CSS, Bootstrap e JavaScript.

## Estrutura

```
frontend/
├── index.html
├── pages/              # Páginas HTML
├── components/
│   └── navbar.js       # Menu lateral (único componente JS)
└── assets/
    ├── css/
    └── js/
        ├── api.js      # Cliente HTTP + endpoints
        └── *.js        # Script de cada página
```

## Executar

```bash
cd frontend
npm install
npm run dev
```

## Integrar com o backend

Em `assets/js/api.js`, altere `useMock: false`. O backend deve estar em `http://localhost:8080`.
