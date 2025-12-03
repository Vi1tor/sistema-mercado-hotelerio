# 🚀 Guia de Instalação e Execução - SMH

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **MongoDB** (versão 6 ou superior) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (opcional, para controle de versão)

## 🔧 Instalação

### 1. Instalar Dependências

Abra o PowerShell na pasta do projeto e execute:

```powershell
npm install
```

Este comando irá instalar todas as dependências necessárias para o frontend e backend.

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```powershell
Copy-Item .env.example .env
```

Edite o arquivo `.env` e configure suas credenciais:

```env
# Banco de Dados MongoDB
MONGODB_URI=mongodb://localhost:27017/hotel-market-analysis

# Porta do Servidor
PORT=3001

# Ambiente
NODE_ENV=development
```

### 3. Iniciar MongoDB

Certifique-se de que o MongoDB está rodando:

**Opção 1: MongoDB Local**
```powershell
# Se instalou como serviço do Windows, ele já deve estar rodando
# Caso contrário, execute:
mongod
```

**Opção 2: MongoDB Atlas (Cloud)**
- Crie uma conta gratuita em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crie um cluster gratuito
- Obtenha a string de conexão
- Cole no arquivo `.env` na variável `MONGODB_URI`

## ▶️ Executar o Sistema

### Modo Desenvolvimento (Recomendado)

Execute frontend e backend simultaneamente:

```powershell
npm run dev
```

Isso irá iniciar:
- **Frontend (Vite + React)**: http://localhost:3000
- **Backend (Node.js + Express)**: http://localhost:3001

### Executar Separadamente

**Apenas Frontend:**
```powershell
npm run dev:client
```

**Apenas Backend:**
```powershell
npm run dev:server
```

### Modo Produção

**1. Build do Frontend:**
```powershell
npm run build
```

**2. Executar Backend:**
```powershell
npm run server
```

**3. Preview do Build:**
```powershell
npm run preview
```

## 🗄️ Popular Banco de Dados

Para testar o sistema, você pode popular o banco com dados de exemplo.

### Opção 1: Via Interface

1. Acesse http://localhost:3000
2. Selecione uma cidade
3. O sistema irá gerar dados automaticamente na primeira busca

### Opção 2: Via API (Scraping Manual)

Use um cliente HTTP como Postman ou curl:

```powershell
# Trigger scraping para uma cidade
curl -X POST http://localhost:3001/api/scraping/trigger/Gramado `
  -H "Content-Type: application/json" `
  -d '{"platform": "all"}'
```

Cidades sugeridas para teste:
- Gramado
- Campos do Jordão
- Búzios
- Jericoacoara
- Fernando de Noronha

## 🔍 Verificar Status

### Health Check da API

```powershell
curl http://localhost:3001/api/health
```

### Verificar Cidades Disponíveis

```powershell
curl http://localhost:3001/api/accommodations/meta/cities
```

### Ver Hospedagens

```powershell
curl http://localhost:3001/api/accommodations?city=Gramado
```

## 📱 Acessar o Sistema

Após executar `npm run dev`, abra seu navegador em:

**http://localhost:3000**

### Páginas Disponíveis:

- **Dashboard**: `/` - Visão geral com estatísticas e gráficos
- **Hospedagens**: `/hospedagens` - Lista completa com filtros
- **Análise**: `/analise` - Análise detalhada de mercado
- **Comparação**: `/comparacao` - Comparação de preços por tipo
- **Relatórios**: `/relatorios` - Exportação em PDF/Excel

## 🛠️ Comandos Úteis

### Limpar Cache do Node

```powershell
Remove-Item -Recurse -Force node_modules; npm install
```

### Verificar Versões

```powershell
node --version
npm --version
```

### Ver Logs do Servidor

O servidor exibirá logs no terminal, incluindo:
- Conexões ao banco de dados
- Requisições HTTP
- Tarefas agendadas (scraping, análises)

## ⚙️ Configurações Avançadas

### Alterar Porta do Frontend

Edite `vite.config.js`:

```javascript
server: {
  port: 3000, // Altere para a porta desejada
}
```

### Alterar Porta do Backend

No arquivo `.env`:

```env
PORT=3001 # Altere para a porta desejada
```

### Desabilitar Scraping Automático

Edite `server/index.js` e comente as linhas do cron:

```javascript
// cron.schedule('0 */6 * * *', async () => {
//   await scheduledScraping();
// });
```

## 🐛 Solução de Problemas

### Erro: "Cannot connect to MongoDB"

- Verifique se o MongoDB está rodando
- Confirme a string de conexão no arquivo `.env`
- Teste a conexão: `mongosh` (no terminal)

### Erro: "Port 3000 is already in use"

Outra aplicação está usando a porta. Opções:
1. Feche a outra aplicação
2. Altere a porta no `vite.config.js`

### Erro: "Module not found"

Execute:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Frontend não atualiza

Limpe o cache do Vite:
```powershell
Remove-Item -Recurse -Force .vite
npm run dev
```

## 📚 Próximos Passos

1. **Explore o Dashboard**: Veja estatísticas em tempo real
2. **Adicione Cidades**: Use a API de scraping para coletar dados
3. **Gere Relatórios**: Exporte análises em PDF e Excel
4. **Configure Alertas**: Monitore mudanças de preços
5. **Personalize**: Adapte o sistema às suas necessidades

## 🆘 Suporte

Para mais informações, consulte:
- README.md (documentação principal)
- Código-fonte com comentários
- Exemplos de uso nas rotas da API

## 🎉 Pronto!

Seu sistema está configurado e pronto para uso. Explore todas as funcionalidades e aproveite a análise de mercado hoteleiro!
