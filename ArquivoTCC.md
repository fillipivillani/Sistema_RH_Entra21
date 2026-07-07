Se só haverá Administrador
Usuário / Ator
Administrador
• Cadastra funcionários.
• Gerencia departamentos.
• Gerencia cargos/funções.
• Gerencia documentos.
• Registra movimentações.
• Consulta relatórios e dashboard.

---

Requisitos Funcionais
Cadastros
• Funcionários.
• Departamentos.
• Cargos/Funções.
• Documentos.
• Escalas (opcional).
Consultas
• Funcionários.
• Departamentos.
• Cargos.
• Documentos.
• Histórico de movimentações.
• Ficha funcional.
Funcionalidades
• Cadastro, edição e exclusão lógica.
• Upload de foto do funcionário.
• Upload e download de documentos.
• Controle de status do funcionário.
• Registro de movimentações.
• Integração com API CBO.
• Emissão de relatórios.
• Dashboard com indicadores.

---

Fluxo do Processo
Cadastro de Funcionário

1. Administrador cadastra o funcionário.
2. Vincula departamento e cargo.
3. Define status.
4. Salva o cadastro.
   Movimentação
5. Administrador seleciona o funcionário.
6. Atualiza cargo, departamento ou salário.
7. Sistema registra o histórico.
   Documentos
8. Administrador seleciona o funcionário.
9. Faz upload dos documentos.
10. Sistema vincula os arquivos à ficha funcional.

---

Dados Necessários
Funcionário
• Nome
• CPF
• RG
• Data de nascimento
• Telefone
• E-mail
• Endereço
• Data de admissão
• Salário
• Foto
• Status
Departamento
• Nome
• Descrição
Cargo
• Nome
• Código CBO
• Departamento
Documento
• Nome do arquivo
• Tipo do documento
• Data de upload
Movimentação
• Cargo anterior
• Cargo novo
• Departamento anterior
• Departamento novo
• Salário anterior
• Salário novo
• Data da movimentação

---

Entidades
• Funcionário
• Departamento
• Cargo
• Documento
• Movimentação
• Escala (Opcional)

---

Relacionamentos
• Um Departamento possui vários Funcionários.
• Um Departamento possui vários Cargos.
• Um Funcionário possui um Cargo.
• Um Funcionário possui vários Documentos.
• Um Funcionário possui várias Movimentações.
• Um Cargo pertence a um Departamento.

---

Status do Funcionário
• Ativo
• Inativo
• Afastado
• Desligado
Posição/Função
• Cargo ocupado pelo funcionário.
• Sempre vinculado a um departamento.
• Mantém histórico de alterações através das movimentações.
