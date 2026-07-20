# Contrato da API — Sistema RH Entra21

Base URL: `http://localhost:8080/api/v1`

## Departamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/departamento/buscarTodos` | Lista todos os departamentos |
| GET | `/departamento/buscarPorId/{id}` | Busca departamento por ID |
| POST | `/departamento/criarDepartamento` | Cria um departamento |
| PUT | `/departamento/editarDepartamento/{id}` | Atualiza um departamento |
| DELETE | `/departamento/deletarDepartamento/{id}` | Remove um departamento |

### Request body (criar/editar)

```json
{
  "nome": "Tecnologia da Informação",
  "descricao": "Desenvolvimento de sistemas",
  "ativo": true
}
```

### Response (Departamento)

```json
{
  "id": 1,
  "nome": "Tecnologia da Informação",
  "descricao": "Desenvolvimento de sistemas",
  "ativo": true
}
```

### Erros

Respostas de erro seguem o formato:

```json
{
  "message": "Departamento não encontrado",
  "status": 404
}
```

## Mapeamento frontend ↔ backend

| Frontend (`assets/js/api.js`) | Backend (`com.rh.controller`) |
|--------------------------------|-------------------------------|
| `API.departamentos` | `DepartamentoController` |
| *(a implementar)* | Funcionário |

## Ativar integração real

1. Suba o backend: `cd backend && mvn spring-boot:run`
2. Suba o frontend: `cd frontend && npm run dev`
3. Em `frontend/assets/js/api.js`, altere `useMock` para `false`
