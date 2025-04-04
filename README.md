# Api Carteira Financeira

## Objetivo

Construir uma carteira financeira onde os usuários possam transferir saldo entre si. Haverá apenas um tipo de usuário, que pode enviar e receber dinheiro de outros usuários dentro do sistema.

----

## Tecnologias

Este projeto foi desenvolvido utilizando o seguinte stack:

- **Node.js**
- **NestJS**
- **TypeScript**
- **Prisma**
- **Postgres**

Essas tecnologias fornecem escalabilidade, segurança de tipos e boas práticas modernas para construir aplicações de fácil manutenção.

## Estrutura do Projeto

1. **Usuário (User)**: Registra-se no sistema, autentica-se e pode depositar/enviar/receber dinheiro.
2. **Conta (Account)**: Armazena o saldo do usuário.
3. **Transação (Transaction)**: Gerencia transferências de dinheiro entre contas, garantindo que cada transferência possa ser revertida em caso de inconsistência ou por solicitação do usuário.


## Modelagem do Banco de Dados

O diagrama abaixo representa a modelagem do banco de dados usada na aplicação:

![diagram](img/diagram.svg)

- **Tabela User**:

  - `id`: Chave Primária (UUID)
  - `email`: Email do usuário
  - `name`: Nome do usuário
  - `password`: Senha criptografada
  - `accountId`: Chave estrangeira para a tabela Account
  - `createdAt`: Data de criação do usuário
  - `updatedAt`: Data da ultima atualização do usuário

- **Tabela Account**:

  - `id`: Chave Primária (UUID)
  - `number`: Chave unica
  - `balance`: Saldo disponível do usuário
  - `createdAt`: Data de criação da conta
  - `updatedAt`: Data da ultima atualização do conta

- **Tabela Transaction**:

  - `id`: Chave Primária (UUID)
  - `amount`: 
  - `status`: Status atual da transação (ex.: "SUCCESS", "CANCELLED", "PENDING")
  - `createdAt`: Data de criação da transação

---

## Funcionalidades

1. **Cadastro de Usuário**:

   - Os usuários podem criar uma conta fornecendo nome, email e senha.

2. **Autenticação**:

   - O sistema inclui autenticação, garantindo acesso seguro através de autenticação baseada em token.

3. **Transferência de Saldo**:

   - Os usuários pode realizar depositos.
   - Os usuários podem enviar e receber dinheiro entre si.
   - Antes de processar uma transferência, o sistema valida se o remetente tem saldo suficiente.
   - As transações são registradas com segurança na tabela `Transaction`.

4. **Reversão de Transação**:

   - Transações podem ser revertidas em caso de inconsistências ou por solicitação do usuário.
   - O processo de reversão garante que a transação original seja referenciada e tratada adequadamente.

## Configuração e Execução

1. **Clonar o repositório**:

   ```bash
   git clone <url-do-repositorio>
   cd carteira-financeira
   ```

2. **Instalar dependências**:

   ```bash
   npm install
   ```

3. **Configuração do Ambiente**:
   Crie um arquivo `.env` na raiz do projeto e defina as variáveis de ambiente necessárias, como conexão com o banco de dados e segredo do JWT.
   ```
   Obs: O `.env.example` tem todas as infos que devem ser utilizada para criar o .env
   ```
4. **Executar a Aplicação**:
   Para rodar o projeto, é necessário ter o Docker e o Docker Compose instalados na máquina. Em seguida, execute o comando:

   ```bash
   docker compose up
   ```
