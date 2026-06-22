# Sistema de RH (Recursos Humanos)

Projeto monolítico para gerenciamento de recursos humanos desenvolvido com **Spring Boot**, **HTML/CSS/Bootstrap** e **PostgreSQL**.

## 🎯 Objetivo

Criar um sistema integrado para gerenciar funcionários, departamentos, folhas de pagamento, férias e avaliações de desempenho.

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 17**
- **Spring Boot 3.1**
- **Spring Data JPA**
- **PostgreSQL 15**
- **Flyway** (versionamento de BD)
- **Lombok** (redução de boilerplate)
- **JUnit 5 + Mockito** (testes)

### Frontend
- **HTML5**
- **CSS3**
- **Bootstrap 5**
- **JavaScript**

### Ferramentas
- **Maven** (gerenciamento de dependências)
- **Docker & Docker Compose** (containerização)
- **Postman** (testes de API)
- **GitHub** (controle de versão)

## 📁 Estrutura do Projeto

```
projeto-rh/
├── src/
│   ├── main/
│   │   ├── java/com/rh/
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── service/         # Lógica de negócio
│   │   │   ├── repository/      # Acesso a dados
│   │   │   ├── model/           # Entidades JPA
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── exception/       # Exceções customizadas
│   │   │   └── config/          # Configurações
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/    # Scripts SQL (Flyway)
│   └── test/java/com/rh/        # Testes unitários e integração
├── public/                        # Arquivos estáticos
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── pages/                    # Páginas HTML
│   └── components/               # Componentes reutilizáveis
├── database/
│   └── migrations/               # Scripts SQL
├── docs/                         # Documentação
├── pom.xml                       # Dependências Maven
├── docker-compose.yml            # Docker Compose
├── .gitignore
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Java 17 ou superior
- Maven 3.8+
- Docker & Docker Compose (opcional)
- Git

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/Sistema_RH_Entra21.git
cd Sistema_RH_Entra21
```

### 2. Configurar o Banco de Dados

#### Opção A: Com Docker Compose
```bash
docker-compose up -d
```

Isso iniciará PostgreSQL e PgAdmin:
- **PostgreSQL**: localhost:5432
- **PgAdmin**: localhost:5050
- **Usuário**: postgres
- **Senha**: postgres123

#### Opção B: PostgreSQL Local
Certifique-se de que PostgreSQL está instalado e em execução na porta 5432.

### 3. Configurar Credenciais
Edite `src/main/resources/application.properties` com suas credenciais do BD:

```properties
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
spring.datasource.url=jdbc:postgresql://localhost:5432/rh_database
```

### 4. Compilar e Executar
```bash
mvn clean install
mvn spring-boot:run
```

A aplicação estará disponível em: `http://localhost:8080/api`

### 5. Frontend
Abra `public/index.html` no navegador ou sirva os arquivos estáticos através do backend.

### Testes com Postman
Importe a coleção em `.postman/collections.json` no Postman e execute os testes.

## 📊 Fluxo de Desenvolvimento

1. **Feature Branch**: `git checkout -b feature/sua-feature`
2. **Desenvolver**: Implementar a funcionalidade
3. **Testes**: Escrever testes unitários
4. **Commit**: `git commit -m "feat: descrição da feature"`
5. **Push**: `git push origin feature/sua-feature`
6. **Pull Request**: Criar PR para branch `main`

## 👥 Contribuidores

Fillipi Villani
Eduardo Domingues
Yuri
Tiago
Argel