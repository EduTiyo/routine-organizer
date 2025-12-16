## Objetivo

Fazer com que crianças neurodivergentes, que possuem dificuldade no aprendizado de rotinas, sintam mais facilidade no seu dia a dia.

## Público-alvo

Crianças neurodivergentes na faixa etária de 4-10 anos.

## Requisitos de aprendizagem

- **Sinalização Explícita da Transição**: O fim de uma atividade (sinal sonoro e visual) deve ser imediatamente seguido pelo destaque da próxima. Isso ensina a Transição Cartões de forma segura.
- **Suporte à Comunicação Aumentativa**: O OA deve suportar o uso de imagens para a representação das atividades, facilitando a compreensão.
- **Medição Temporal Concreta**: O tempo alocado para a tarefa (Timer) deve ser representado visualmente (ponteiro) de forma concreta, ajudando o aluno a internalizar a passagem do tempo.
- **Incentivo à Ação e Conclusão**: O sistema deve exigir uma ação voluntária do aluno para registrar o término da atividade, promovendo o senso de responsabilidade e autonomia.
- **Feedback Reforçador Imediato**: O reforço positivo (auditivo e visual) deve ser imediato e consistente após a conclusão correta, incentivando a repetição do comportamento desejado.

## Mapa Conceitual

<img width="1017" height="559" alt="image" src="https://github.com/user-attachments/assets/97c6e058-1e0d-4dad-8589-43ccfa8f7d39" />

## Modelo Instrucional

### Link para Modelo

https://drive.google.com/file/d/1lK0rp8DiDv3jrDvKlzr48NFV3PE_2BDy/view?usp=sharing

<img width="927" height="1192" alt="modelo_instrucional drawio" src="https://github.com/user-attachments/assets/b7a7f440-eb5a-4b56-ad3c-1aec933d98ff" />

## Plano de Aula

Está disponível no arquivo `plano-de-aula-rotina.md`

## Pré-requisitos
- Node.js (LTS recomendado)
- Docker e Docker Compose
- Gerenciador de pacotes (`npm`, `yarn` ou `pnpm`)

## Configuração e Instalação

1. Clonar o repositório
```bash
git clone https://github.com/learningspace-utfpr-cm/routine-organizer.git
cd routine-organizer
```
2. Instalar dependências
```bash
npm install
# ou
yarn install
```
3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto. Você pode basear-se no arquivo `.env.example`
```env
# Banco de Dados
DATABASE_URL="postgresql://routine:routine123@localhost:5432/routine-db?schema=public"

# Autenticação (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_URL_INTERNAL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui" # Gere uma string segura

# MinIO (Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9001
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="virtual-cards"
MINIO_REGION="us-east-1"
MINIO_PUBLIC_URL="http://localhost:9001"
```

4. Subir a infraestrutura com Docker
Este projeto utiliza Docker para rodar o banco de dados PosgreSQL e MinIO. Execute:
```bash
docker compose up -d
```

4. Configurar o Banco de Dados (Prisma)
Com os containers rodando, execute as migrações para criar as tabelas no banco:
```bash
npx primsa generate
npx prisma migrate dev --name init
```

## Executar a aplicação
Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

## Licença

Este objeto de aprendizagem está licenciado sob  
[CC BY 4.0 — Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Você é livre para:

- Compartilhar — copiar e redistribuir o material
- Adaptar — remixar, transformar e criar a partir do material
- Para qualquer finalidade, mesmo comercial

Desde que atribua o crédito apropriado.

[![CC BY 4.0][cc-by-shield]][cc-by]

[cc-by]: https://creativecommons.org/licenses/by/4.0/
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg
