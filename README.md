# MJDS Monitor

Sistema de monitoramento de sites com verificação de CDN e status desenvolvido em Next.js.

## 🚀 Funcionalidades

- **Monitoramento Automático**: Verifica sites em intervalos configuráveis
- **Verificação de CDN**: Detecta automaticamente referências à CDN MJDS
- **Status em Tempo Real**: Exibe status online/offline/frontdoor
- **Análise de Headers**: Monitora cache-control, last-modified e outros headers
- **Detecção Azure Front Door**: Identifica se o site usa Azure Front Door
- **Informações de Cache**: Mostra status e tempos de cache
- **Interface Responsiva**: Design moderno com Tailwind CSS
- **Alerta Sonoro**: Notificação quando sites ficam offline
- **Armazenamento Local**: Dados salvos em arquivos JSON (local) ou memória (Vercel)

## 🛠 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (requisições HTTP)
- **React Query** (gerenciamento de estado)

## 📦 Instalação Local

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd mjds-monitor
```

2. Instale as dependências:
```bash
yarn install
```

3. Execute o projeto:
```bash
yarn dev
```

4. Acesse: `http://localhost:3000`

## 🚀 Deploy na Vercel

### Método 1: Deploy Automático
1. Conecte seu repositório GitHub à Vercel
2. A Vercel detectará automaticamente que é um projeto Next.js
3. Clique em "Deploy"

### Método 2: Deploy Manual
```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel --prod
```

### ⚠️ Importante para Vercel
- A aplicação usa dados em memória na Vercel (sem persistência)
- Dados são resetados a cada deploy
- Para persistência, considere usar um banco de dados

## 📁 Estrutura do Projeto

```
mjds-monitor/
├── data/                    # Arquivos JSON de dados (local)
│   ├── tipos.json          # Tipos de sites
│   ├── sites.json          # Sites monitorados
│   └── monitoramento.json  # Dados de monitoramento
├── src/
│   ├── app/                # App Router do Next.js
│   │   ├── api/            # API Routes
│   │   └── page.tsx        # Página principal
│   └── components/         # Componentes React
├── utils/                  # Utilitários
├── public/                 # Assets estáticos
├── vercel.json            # Configuração Vercel
└── README.md
```

## 🔧 Configuração

### Intervalo de Verificação
- Configurável via interface (30s a 1h)
- Verificação manual disponível
- Monitoramento automático em background

### Tipos de Sites
- Institucional
- Comercial
- Painel
- Personalizáveis via interface

## 📊 Monitoramento

### Status Detectados
- 🟢 **Online**: HTTP 200-299
- 🔴 **Offline**: Erro de conexão ou HTTP 4xx/5xx
- ⚠️ **Frontdoor**: HTTP 403/503 (possível proteção)

### Informações Coletadas
- Status HTTP
- Tempo de resposta
- Versão da CDN (se detectada)
- Headers (Cache-Control, Last-Modified)
- Azure Front Door (detecção automática)
- Status de cache e tempos
- Última verificação

### Detecção de CDN
- Padrões: `cdn.mjds.com.br`, `ca.mjds.com.br`
- Extração de versão via regex
- Suporte a query strings e paths

### Detecção Azure Front Door
- Headers: `x-azure-ref`, `x-ms-ref`
- Server headers contendo "Azure"
- Via headers contendo "azure"

## 🔍 API Endpoints

- `GET /api/verificar` - Verifica todos os sites
- `GET /api/sites` - Lista sites cadastrados
- `POST /api/sites` - Adiciona novo site
- `DELETE /api/sites?id=X` - Remove site
- `GET /api/tipos` - Lista tipos
- `POST /api/tipos` - Adiciona novo tipo
- `DELETE /api/tipos?id=X` - Remove tipo
- `GET /api/monitoramento` - Dados de monitoramento

## 📝 Uso

1. **Adicionar Tipos**: Configure categorias de sites
2. **Adicionar Sites**: Cadastre URLs para monitoramento
3. **Configurar Intervalo**: Ajuste frequência de verificação
4. **Monitorar**: Acompanhe status em tempo real

## 🔧 Solução de Problemas

### Erro 404 na Vercel
- ✅ Verifique se o build está passando
- ✅ Confirme que o `vercel.json` está configurado
- ✅ Verifique os logs de deploy na Vercel

### Problemas de Build
- ✅ Execute `yarn build` localmente
- ✅ Verifique se todas as dependências estão instaladas
- ✅ Confirme que não há erros de TypeScript

### Dados não persistem na Vercel
- ✅ Normal: Vercel usa dados em memória
- ✅ Dados são resetados a cada deploy
- ✅ Para persistência, use um banco de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. 