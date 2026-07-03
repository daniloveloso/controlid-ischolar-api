# controlid-ischolar-api

API de integração entre ControlID (catracas) e iScholar.

Este projeto recebe eventos de identificação das catracas ControlID, aplica regras de liberação (usuário ativo, tipo de usuário, verificação no iScholar) e registra logs no banco de dados via Prisma. Também oferece jobs para sincronização de usuários e monitoramento de dispositivos.

## Principais funcionalidades

- Recebe eventos da ControlID (`/new_user_identified.fcgi`) e responde imediatamente indicando se a catraca deve liberar o usuário.
- Registra logs de acesso em banco (modelo `AccessLog`) e logs de comunicação com o iScholar (`IscholarLog`).
- Sincroniza usuários a partir da ControlID e valida presença no iScholar.
- Scheduler para monitorar dispositivos (catracas) e executar jobs periódicos.

## Stack

- Node.js + TypeScript (rodando com `tsx` em desenvolvimento)
- Express
- Prisma ORM
- PostgreSQL (via `DATABASE_URL`)
- Axios para chamadas HTTP externas (iScholar / ControlID)

## Estrutura importante

- `src/server.ts` — ponto de entrada da API
- `src/controllers/` — regras das rotas (ControlID, usuários)
- `src/services/` — integrações com iScholar e ControlID
- `src/routes/` — rotas HTTP expostas
- `src/scripts/` e `src/jobs/` — scripts e jobs para tarefas manuais/cron
- `prisma/schema.prisma` — modelos do banco

## Endpoints principais

- `POST /new_user_identified.fcgi` — chamada feita pela ControlID quando um usuário é identificado. A API responde imediatamente com o comando para a catraca.
- `GET|POST /device_is_alive.fcgi` — health check usado pela catraca.
- `POST /session_is_valid.fcgi` — endpoint usado pela ControlID para verificar sessão.
- `POST /new_biometric_template.fcgi` — tópico de recebimento de templates biométricos (implementação mínima).
- `POST /users/` — criar usuário local (espera JSON com `nome`, `controlidUserId` e opcional `matricula`).
- `POST /sync/controlid-users` — dispara job de sincronização com a ControlID (rota interna em `src/routes/sync.routes.ts`).

## Models (prisma)

Principais modelos no `prisma/schema.prisma`:

- `User` — usuários controlid / ischolar (campos relevantes: `controlidUserId`, `tipo` [`ALUNO`|`FUNCIONARIO`], `matricula`, `ischolarAtivo`).
- `AccessLog` — logs de tentativas de acesso (resultado: `LIBERADO`/`NEGADO`).
- `IscholarLog` — resposta do iScholar ao registrar acessos.

## Variáveis de ambiente

Crie um arquivo `.env` (veja `.env.example`) com as variáveis necessárias:

- `PORT` — porta onde a API será executada (default 3000)
- `DATABASE_URL` — string de conexão PostgreSQL (ex: `postgresql://user:pass@host:5432/db`)
- `ISCHOLAR_TOKEN` — token de autorização para a API do iScholar
- `ISCHOLAR_ESCOLA` — código da escola para o iScholar
- `CONTROLID_URL` — URL base da ControlID (usada para login e operações)
- `CONTROLID_USER` — usuário para autenticar na ControlID
- `CONTROLID_PASS` — senha para autenticar na ControlID
- `CONTROLID_<deviceId>_URL` — URL específica do dispositivo para `liberarCatraca` (opcional)
- `CONTROLID_<deviceId>_SESSION` — sessão para cada dispositivo (opcional)

Observação: alguns valores (como sessões por dispositivo) podem ser configurados no ambiente para permitir requisições diretas de liberação.

## Como rodar (desenvolvimento)

1. Instale dependências:

```bash
npm install
```

2. Copie o `.env.example` para `.env` e ajuste as variáveis.

3. Gere o client do Prisma e rode migrações (se necessário):

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Inicie em modo desenvolvimento (hot-reload com `tsx`):

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000` (ou na porta configurada em `PORT`).

## Migração e produção

- Para produção, faça o `build` TypeScript e execute `node dist/server.js`.
- Ajuste `DATABASE_URL` para apontar ao banco de produção e execute as migrações com `npm run prisma:migrate` em ambiente controlado.

## Configuração das catracas

Os IPs das catracas estão em `src/config/catracas.config.ts`. A integração com cada dispositivo requer que a ControlID esteja configurada para enviar eventos para os endpoints desta API.

Para liberação remota de catraca a função `liberarCatraca` espera variáveis de ambiente no formato `CONTROLID_<deviceId>_URL` e `CONTROLID_<deviceId>_SESSION` quando usadas.

## Logs e observabilidade

- A aplicação escreve logs simples no stdout (requer integração externa para monitoramento avançado).
- Os eventos e respostas do iScholar são persistidos em `IscholarLog` para auditoria.

## Scripts úteis

- `npm run dev` — desenvolvimento com `tsx`.
- `npm run build` — transpila TypeScript.
- `npm run start` — executa `dist/server.js`.
- `npm run prisma:generate` — gera Prisma Client.
- `npm run prisma:migrate` — aplica migrações em ambiente de desenvolvimento.

## Observações e limites

- A rota `/new_user_identified.fcgi` responde imediatamente à ControlID para não bloquear o mecanismo de liberação; o registro em banco e a chamada ao iScholar ocorrem após a resposta.
- Garantir que `ISCHOLAR_TOKEN` e `ISCHOLAR_ESCOLA` estejam corretos para operações com o iScholar.

## Contribuição

1. Fork do repositório
2. Crie uma branch com a mudança: `git checkout -b feature/minha-mudanca`
3. Commit e PR explicando a alteração

## Contato

Para dúvidas ou detalhes sobre integração, abra uma issue ou entre em contato com os mantenedores do repositório.

