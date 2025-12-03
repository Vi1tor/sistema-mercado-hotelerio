# 🎯 COMO INICIAR O PROJETO

## ⚡ Início Rápido (3 passos)

### 1️⃣ Instale as dependências
```powershell
npm install
```

### 2️⃣ Configure o ambiente
```powershell
Copy-Item .env.example .env
```

### 3️⃣ Inicie o sistema
```powershell
npm run dev
```

✅ **Pronto!** Acesse http://localhost:3000

---

## 📝 Notas Importantes

### MongoDB
O sistema precisa do MongoDB rodando. Escolha uma opção:

**Opção A: MongoDB Local**
- Instale: https://www.mongodb.com/try/download/community
- O serviço deve iniciar automaticamente no Windows

**Opção B: MongoDB Atlas (Cloud - Grátis)**
- Crie conta: https://www.mongodb.com/cloud/atlas
- Obtenha a connection string
- Cole no arquivo `.env` em `MONGODB_URI`

### Primeira Execução
Na primeira vez, o banco estará vazio. Para popular com dados de teste:

1. Acesse http://localhost:3000
2. Selecione uma cidade (ex: "Gramado")
3. O sistema gerará dados automaticamente

Ou via API:
```powershell
curl -X POST http://localhost:3001/api/scraping/trigger/Gramado `
  -H "Content-Type: application/json" `
  -d '{"platform": "booking"}'
```

---

## 🌐 URLs do Sistema

Após executar `npm run dev`:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 📦 Estrutura de Pastas

```
SMH/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços de API
│   ├── contexts/          # Context API
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Funções utilitárias
│   └── styles/            # Estilos globais
│
├── server/                # Backend Node.js
│   ├── models/            # Modelos do MongoDB
│   ├── routes/            # Rotas da API
│   ├── services/          # Lógica de negócio
│   └── scrapers/          # Scrapers de dados
│
├── public/                # Arquivos estáticos
├── .env                   # Variáveis de ambiente (criar)
├── .env.example           # Exemplo de configuração
├── package.json           # Dependências
└── README.md              # Documentação principal
```

---

## 🎨 Funcionalidades Principais

### 1. Dashboard
- Visão geral do mercado
- Estatísticas em tempo real
- Gráficos interativos
- Análise de demanda

### 2. Hospedagens
- Lista completa de hospedagens
- Filtros avançados (tipo, preço, nota)
- Detalhes individuais
- Histórico de preços

### 3. Análise de Mercado
- Análise de demanda
- Tendências de preços
- Alertas automáticos
- Recomendações estratégicas

### 4. Comparação
- Comparação por tipo de hospedagem
- Análise de preços médios
- Faixa de preços
- Avaliações

### 5. Relatórios
- Exportação em PDF
- Exportação em Excel
- Análises completas
- Gráficos e estatísticas

---

## 🛠️ Scripts Disponíveis

```powershell
# Desenvolvimento (Frontend + Backend)
npm run dev

# Apenas Frontend
npm run dev:client

# Apenas Backend
npm run dev:server

# Build para Produção
npm run build

# Preview do Build
npm run preview

# Servidor de Produção
npm run server
```

---

## ❓ Problemas Comuns

### ❌ Erro: Cannot connect to MongoDB
**Solução**: Verifique se o MongoDB está rodando ou configure MongoDB Atlas

### ❌ Erro: Port 3000 already in use
**Solução**: Feche outras aplicações ou altere a porta em `vite.config.js`

### ❌ Erro: Module not found
**Solução**: Execute `npm install` novamente

---

## 📚 Documentação Adicional

- **INSTALLATION.md** - Guia detalhado de instalação
- **README.md** - Documentação completa do sistema
- Comentários no código-fonte

---

## 🎉 Próximos Passos

1. ✅ Instale e inicie o sistema
2. 📊 Explore o Dashboard
3. 🏨 Adicione hospedagens via scraping
4. 📈 Gere análises de mercado
5. 📄 Exporte relatórios

---

## 🆘 Precisa de Ajuda?

Consulte a documentação completa em:
- README.md
- INSTALLATION.md
- Código-fonte com comentários detalhados

---

**Sistema desenvolvido com ❤️ usando React, Node.js, MongoDB e tecnologias modernas**
