# Sistema de RH (Recursos Humanos)

Monorepo para gerenciamento de recursos humanos com **Spring Boot** (backend) e **HTML/CSS/Bootstrap** (frontend).

## Estrutura do Projeto

```
Sistema_RH_Entra21/
├── backend/                    # API REST (Spring Boot)
│   ├── src/main/java/com/rh/
│   │   ├── controller/         # Endpoints REST
│   │   ├── service/            # Regras de negócio
│   │   ├── repository/         # Acesso a dados (JPA)
│   │   ├── model/              # Entidades
│   │   ├── dto/                # Objetos de transferência
│   │   ├── exception/          # Exceções customizadas
│   │   └── config/             # CORS e configurações web
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/       # Scripts Flyway
├── frontend/                   # Interface estática
│   ├── pages/                  # Páginas HTML
│   ├── components/             # Componentes reutilizáveis
│   └── assets/
│       ├── css/
│       └── js/
│           ├── api.js          # Cliente HTTP
│           └── *.js            # Scripts por página
├── database/                   # Diagramas e scripts auxiliares
├── docs/api/                   # Contrato da API REST
├── postman/                    # Coleção Postman
└── docker-compose.yml          # PostgreSQL + PgAdmin
```

## Tecnologias

| Camada | Stack |
|--------|-------|
| Backend | Java 21, Spring Boot 3.2, JPA, PostgreSQL, Flyway, Lombok |
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript (vanilla) |
| DevOps | Maven, Docker Compose, Postman |

## Como Executar

### Pré-requisitos

- Java 21+
- Maven 3.8+
- Node.js 18+ (servidor de desenvolvimento do frontend)
- Docker (opcional, para o banco)

### 1. Banco de dados

```bash
docker-compose up -d
```

- **PostgreSQL**: `localhost:5432`
- **PgAdmin**: `localhost:5050`

### 2. Backend

```bash
cd backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edite application.properties com suas credenciais
mvn spring-boot:run
```

API disponível em: `http://localhost:8080/api/v1`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Interface em: `http://localhost:5500`

### 4. Integrar frontend com backend

1. Com backend e frontend rodando, abra `frontend/assets/js/api.js`
2. Altere `useMock` para `false`
3. Recarregue a página — as chamadas passam a ir para a API REST

Documentação completa dos endpoints: [`docs/api/README.md`](docs/api/README.md)

## Fluxo de Desenvolvimento

1. Implemente o endpoint no backend (`controller` → `service` → `repository`)
2. Crie/adicione o recurso em `frontend/assets/js/api.js`
3. Atualize a documentação em `docs/api/`
4. Teste com a coleção Postman em `postman/`

## Contribuidores

Fillipi Villani · Eduardo Domingues · Yuri · Tiago · Argel
