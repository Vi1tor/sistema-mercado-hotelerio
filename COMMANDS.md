# 🔧 Comandos Úteis - PowerShell

## 📦 Instalação e Setup

# Instalar dependências
npm install

# Copiar arquivo de exemplo
Copy-Item .env.example .env

# Popular banco de dados com dados de exemplo
npm run seed

## 🚀 Executar Aplicação

# Desenvolvimento (Frontend + Backend)
npm run dev

# Apenas Frontend
npm run dev:client

# Apenas Backend
npm run dev:server

# Build para produção
npm run build

# Preview do build
npm run preview

# Servidor de produção
npm run server

## 🗄️ MongoDB

# Iniciar MongoDB (se instalado localmente)
# Windows Service (geralmente já está rodando)
Get-Service -Name MongoDB

# Conectar ao MongoDB via shell
mongosh

# Ver bancos de dados
mongosh --eval "show dbs"

# Conectar ao banco do projeto
mongosh hotel-market-analysis

# Ver coleções
mongosh hotel-market-analysis --eval "show collections"

# Contar documentos
mongosh hotel-market-analysis --eval "db.accommodations.countDocuments()"

# Limpar banco de dados (CUIDADO!)
mongosh hotel-market-analysis --eval "db.dropDatabase()"

## 🧹 Limpeza

# Limpar node_modules e reinstalar
Remove-Item -Recurse -Force node_modules
npm install

# Limpar cache do npm
npm cache clean --force

# Limpar cache do Vite
Remove-Item -Recurse -Force .vite
Remove-Item -Recurse -Force dist

## 🔍 Verificações

# Verificar versões
node --version
npm --version
mongosh --version

# Testar conexão com backend
curl http://localhost:3001/api/health

# Ver todas as cidades disponíveis
curl http://localhost:3001/api/accommodations/meta/cities

# Ver hospedagens de uma cidade
curl http://localhost:3001/api/accommodations?city=Gramado

# Análise de demanda
curl http://localhost:3001/api/analysis/demand/Gramado

## 📊 Popular Dados

# Popular via seed script
npm run seed

# Trigger scraping para cidade específica
$body = @{
    platform = "booking"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/scraping/trigger/Gramado" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Gerar análise de mercado
Invoke-RestMethod -Uri "http://localhost:3001/api/analysis/market/Gramado/generate" `
    -Method Post

## 📄 Baixar Relatórios

# Baixar relatório PDF
Invoke-WebRequest -Uri "http://localhost:3001/api/reports/pdf/Gramado" `
    -OutFile "relatorio-gramado.pdf"

# Baixar relatório Excel
Invoke-WebRequest -Uri "http://localhost:3001/api/reports/excel/Gramado" `
    -OutFile "relatorio-gramado.xlsx"

## 🔧 Git (se estiver usando)

# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - Sistema de Mercado Hoteleiro"

# Ver status
git status

# Ver log
git log --oneline

## 📝 Logs e Debugging

# Ver logs do backend (quando rodando)
# Os logs aparecem automaticamente no terminal onde você rodou npm run dev

# Ver erros específicos do MongoDB
mongosh hotel-market-analysis --eval "db.adminCommand({ getLog: 'global' })"

## 🌐 Abrir no Navegador

# Frontend
Start-Process "http://localhost:3000"

# Backend API Health
Start-Process "http://localhost:3001/api/health"

## 📊 Estatísticas do Projeto

# Contar arquivos JavaScript/JSX
(Get-ChildItem -Path . -Include *.js,*.jsx -Recurse -File | Measure-Object).Count

# Contar linhas de código (aproximado)
Get-ChildItem -Path ./src -Include *.js,*.jsx -Recurse | Get-Content | Measure-Object -Line

# Tamanho do node_modules
"{0:N2} MB" -f ((Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB)

## 🔒 Segurança

# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades automaticamente
npm audit fix

# Atualizar dependências (cuidado!)
npm update

## 🎨 Desenvolvimento

# Adicionar nova dependência
npm install nome-do-pacote

# Adicionar como dev dependency
npm install -D nome-do-pacote

# Remover dependência
npm uninstall nome-do-pacote

# Ver dependências desatualizadas
npm outdated

## 📦 Build e Deploy

# Build otimizado
npm run build

# Testar build localmente
npm run preview

# Verificar tamanho do bundle
Get-ChildItem -Path ./dist -Recurse | Measure-Object -Property Length -Sum

## 🧪 Testes (quando implementados)

# Executar testes
npm test

# Testes com cobertura
npm test -- --coverage

# Testes em modo watch
npm test -- --watch

## 💡 Dicas Úteis

# Matar processo na porta 3000 (se travar)
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Matar processo na porta 3001 (backend)
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Ver processos Node rodando
Get-Process node

# Matar todos os processos Node
Get-Process node | Stop-Process -Force

# Copiar arquivo .env de exemplo se não existir
if (-not (Test-Path .env)) { Copy-Item .env.example .env }

# Abrir projeto no VS Code
code .

# Abrir MongoDB Compass (se instalado)
Start-Process mongodb-compass

## 🚨 Troubleshooting

# Se o npm install falhar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install

# Se o MongoDB não conectar
# Verificar se está rodando
Get-Service MongoDB
# Se não estiver, iniciar
Start-Service MongoDB

# Se portas estiverem em uso
# Ver o que está usando a porta 3000
Get-NetTCPConnection -LocalPort 3000
# Ver o que está usando a porta 3001
Get-NetTCPConnection -LocalPort 3001

# Limpar tudo e começar do zero
Remove-Item -Recurse -Force node_modules,.vite,dist
npm install
npm run seed
npm run dev

## 📚 Informações do Sistema

# Ver informações do Node
node -p "process.versions"

# Ver informações do npm
npm config list

# Ver variáveis de ambiente (cuidado com senhas!)
Get-Content .env

# Espaço em disco
Get-PSDrive C | Select-Object Used,Free

## 🎯 Atalhos Úteis

# Criar alias para comandos frequentes
Set-Alias d npm run dev
Set-Alias b npm run build
Set-Alias s npm run seed

# Usar: d, b, s ao invés dos comandos completos

---

💡 **Dica**: Adicione esses aliases ao seu perfil do PowerShell:
`notepad $PROFILE`

E adicione as linhas:
```powershell
function Start-SMH { npm run dev }
Set-Alias smh Start-SMH
```

Depois, você pode simplesmente digitar `smh` para iniciar o projeto!
