import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import { Site, Tipo, SiteStatus } from './verificarSite';

const DATA_DIR = path.join(process.cwd(), 'data');

// Detectar se estamos rodando na Vercel
const isVercel = !!process.env.VERCEL;

// Dados em memória (usados quando escrita em disco não é possível)
let sitesInMemory: Site[] = [];
let tiposInMemory: Tipo[] = [];
let monitoramentoInMemory: Record<string, SiteStatus> = {};

// Carregar dados dos arquivos para uso inicial
try {
  const rawSites = fs.readFileSync(path.join(DATA_DIR, 'sites.json'), 'utf-8');
  sitesInMemory = JSON.parse(rawSites);
} catch {
  sitesInMemory = [];
}

try {
  const rawTipos = fs.readFileSync(path.join(DATA_DIR, 'tipos.json'), 'utf-8');
  tiposInMemory = JSON.parse(rawTipos);
} catch {
  tiposInMemory = [];
}

try {
  const rawMonitoramento = fs.readFileSync(
    path.join(DATA_DIR, 'monitoramento.json'),
    'utf-8'
  );
  monitoramentoInMemory = JSON.parse(rawMonitoramento);
} catch {
  monitoramentoInMemory = {};
}

// Garantir que o diretório data existe
async function ensureDataDir() {
  if (isVercel) return;
  
  try {
    await fsPromises.access(DATA_DIR);
  } catch {
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function lerArquivo<T>(nomeArquivo: string): Promise<T> {
  try {
    await ensureDataDir();
    const caminho = path.join(DATA_DIR, nomeArquivo);
    
    // Verificar se o arquivo existe
    try {
      await fsPromises.access(caminho);
    } catch {
      // Se não existe, retornar array vazio ou objeto vazio
      if (nomeArquivo === 'monitoramento.json') {
        return {} as T;
      }
      return [] as T;
    }
    
    const conteudo = await fsPromises.readFile(caminho, 'utf-8');
    return JSON.parse(conteudo);
  } catch (error) {
    console.error(`Erro ao ler arquivo ${nomeArquivo}:`, error);
    // Falha ao ler do disco, retornar dados em memória
    switch (nomeArquivo) {
      case 'sites.json':
        return sitesInMemory as T;
      case 'tipos.json':
        return tiposInMemory as T;
      case 'monitoramento.json':
        return monitoramentoInMemory as T;
      default:
        if (nomeArquivo === 'monitoramento.json') {
          return {} as T;
        }
        return [] as T;
    }
  }
}

export async function escreverArquivo<T>(nomeArquivo: string, dados: T): Promise<void> {
  try {
    await ensureDataDir();
    const caminho = path.join(DATA_DIR, nomeArquivo);
    await fsPromises.writeFile(caminho, JSON.stringify(dados, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${nomeArquivo}:`, error);
    // Se não for possível escrever, atualizar dados em memória
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