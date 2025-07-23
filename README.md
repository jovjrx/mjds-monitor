# MJDS Monitor

Sistema de monitoramento de sites com verificação de CDN e status desenvolvido em Next.js.

## 🚀 Funcionalidades

- **Monitoramento Automático**: Verifica sites em intervalos configuráveis
- **Verificação de CDN**: Detecta automaticamente referências à CDN MJDS
- **Status em Tempo Real**: Exibe status online/offline/frontdoor
- **Análise de Headers**: Monitora cache-control, last-modified e outros headers
- **Interface Responsiva**: Design moderno com Tailwind CSS
- **Armazenamento Local**: Dados salvos em arquivos JSON

## 🛠 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (requisições HTTP)
- **React Query** (gerenciamento de estado)

## 📦 Instalação

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

## 📁 Estrutura do Projeto

```
mjds-monitor/
├── data/                    # Arquivos JSON de dados
│   ├── tipos.json          # Tipos de sites
│   ├── sites.json          # Sites monitorados
│   └── monitoramento.json  # Dados de monitoramento
├── src/
│   ├── app/                # App Router do Next.js
│   │   ├── api/            # API Routes
│   │   └── page.tsx        # Página principal
│   └── components/         # Componentes React
├── utils/                  # Utilitários
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
- Última verificação

### Detecção de CDN
- Padrões: `cdn.mjds.com.br`, `ca.mjds.com.br`
- Extração de versão via regex
- Suporte a query strings e paths

## 🚀 Deploy

### Vercel (Recomendado)
```bash
yarn build
vercel --prod
```

### Railway
```bash
railway login
railway init
railway up
```

## 📝 Uso

1. **Adicionar Tipos**: Configure categorias de sites
2. **Adicionar Sites**: Cadastre URLs para monitoramento
3. **Configurar Intervalo**: Ajuste frequência de verificação
4. **Monitorar**: Acompanhe status em tempo real

## 🔍 API Endpoints

- `GET /api/verificar` - Verifica todos os sites
- `GET /api/sites` - Lista sites cadastrados
- `POST /api/sites` - Adiciona novo site
- `DELETE /api/sites?id=X` - Remove site
- `GET /api/tipos` - Lista tipos
- `POST /api/tipos` - Adiciona novo tipo
- `DELETE /api/tipos?id=X` - Remove tipo
- `GET /api/monitoramento` - Dados de monitoramento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. 