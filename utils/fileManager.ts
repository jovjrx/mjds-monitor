import { promises as fs } from 'fs';
import path from 'path';
import { Site, Tipo, SiteStatus } from './verificarSite';

const DATA_DIR = path.join(process.cwd(), 'data');

// Dados em memória para Vercel
let sitesInMemory: Site[] = [
  {
    id: "1",
    url: "https://www.google.com",
    nome: "Google",
    tipoId: "1",
    ativo: true
  },
  {
    id: "2",
    url: "https://www.github.com",
    nome: "GitHub",
    tipoId: "2",
    ativo: true
  }
];

let tiposInMemory: Tipo[] = [
  {
    id: "1",
    nome: "Institucional",
    descricao: "Sites institucionais e corporativos"
  },
  {
    id: "2", 
    nome: "Comercial",
    descricao: "Sites comerciais e e-commerce"
  },
  {
    id: "3",
    nome: "Painel",
    descricao: "Painéis administrativos"
  }
];

let monitoramentoInMemory: Record<string, SiteStatus> = {};

// Verificar se estamos na Vercel (sem acesso ao sistema de arquivos)
const isVercel = process.env.VERCEL === '1' || !fs.access;

// Garantir que o diretório data existe
async function ensureDataDir() {
  if (isVercel) return;
  
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function lerArquivo<T>(nomeArquivo: string): Promise<T> {
  if (isVercel) {
    // Na Vercel, usar dados em memória
    switch (nomeArquivo) {
      case 'sites.json':
        return sitesInMemory as T;
      case 'tipos.json':
        return tiposInMemory as T;
      case 'monitoramento.json':
        return monitoramentoInMemory as T;
      default:
        return [] as T;
    }
  }

  try {
    await ensureDataDir();
    const caminho = path.join(DATA_DIR, nomeArquivo);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(caminho);
    } catch {
      // Se não existe, retornar array vazio ou objeto vazio
      if (nomeArquivo === 'monitoramento.json') {
        return {} as T;
      }
      return [] as T;
    }
    
    const conteudo = await fs.readFile(caminho, 'utf-8');
    return JSON.parse(conteudo);
  } catch (error) {
    console.error(`Erro ao ler arquivo ${nomeArquivo}:`, error);
    // Retornar valor padrão baseado no tipo de arquivo
    if (nomeArquivo === 'monitoramento.json') {
      return {} as T;
    }
    return [] as T;
  }
}

export async function escreverArquivo<T>(nomeArquivo: string, dados: T): Promise<void> {
  if (isVercel) {
    // Na Vercel, atualizar dados em memória
    switch (nomeArquivo) {
      case 'sites.json':
        sitesInMemory = dados as Site[];
        break;
      case 'tipos.json':
        tiposInMemory = dados as Tipo[];
        break;
      case 'monitoramento.json':
        monitoramentoInMemory = dados as Record<string, SiteStatus>;
        break;
    }
    return;
  }

  try {
    await ensureDataDir();
    const caminho = path.join(DATA_DIR, nomeArquivo);
    await fs.writeFile(caminho, JSON.stringify(dados, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${nomeArquivo}:`, error);
    throw error;
  }
}

export async function obterSites(): Promise<Site[]> {
  return lerArquivo<Site[]>('sites.json');
}

export async function obterTipos(): Promise<Tipo[]> {
  return lerArquivo<Tipo[]>('tipos.json');
}

export async function obterMonitoramento(): Promise<Record<string, SiteStatus>> {
  return lerArquivo<Record<string, SiteStatus>>('monitoramento.json');
}

export async function salvarSites(sites: Site[]): Promise<void> {
  await escreverArquivo('sites.json', sites);
}

export async function salvarTipos(tipos: Tipo[]): Promise<void> {
  await escreverArquivo('tipos.json', tipos);
}

export async function salvarMonitoramento(monitoramento: Record<string, SiteStatus>): Promise<void> {
  await escreverArquivo('monitoramento.json', monitoramento);
}

export function gerarId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function atualizarSite(id: string, dados: Partial<Site>): Promise<Site | null> {
  const sites = await obterSites();
  const index = sites.findIndex(site => site.id === id);
  if (index === -1) return null;
  sites[index] = { ...sites[index], ...dados };
  await salvarSites(sites);
  return sites[index];
}

export async function atualizarTipo(id: string, dados: Partial<Tipo>): Promise<Tipo | null> {
  const tipos = await obterTipos();
  const index = tipos.findIndex(tipo => tipo.id === id);
  if (index === -1) return null;
  tipos[index] = { ...tipos[index], ...dados };
  await salvarTipos(tipos);
  return tipos[index];
}