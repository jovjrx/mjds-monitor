import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import { Site, Tipo, SiteStatus } from './verificarSite';
import NodeCache from 'node-cache';

const DATA_DIR = path.join(process.cwd(), 'data');

const isVercel = !!process.env.VERCEL;

let sitesInMemory: Site[] = [];
let tiposInMemory: Tipo[] = [];
let monitoramentoInMemory: Record<string, SiteStatus> = {};

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

try {
  const rawSites = fs.readFileSync(path.join(DATA_DIR, 'sites.json'), 'utf-8');
  sitesInMemory = JSON.parse(rawSites);
  cache.set('sites', sitesInMemory);
} catch {
  sitesInMemory = [];
  cache.set('sites', []);
}

try {
  const rawTipos = fs.readFileSync(path.join(DATA_DIR, 'tipos.json'), 'utf-8');
  tiposInMemory = JSON.parse(rawTipos);
  cache.set('tipos', tiposInMemory);
} catch {
  tiposInMemory = [];
  cache.set('tipos', []);
}

try {
  const rawMonitoramento = fs.readFileSync(
    path.join(DATA_DIR, 'monitoramento.json'),
    'utf-8'
  );
  monitoramentoInMemory = JSON.parse(rawMonitoramento);
  cache.set('monitoramento', monitoramentoInMemory);
} catch {
  monitoramentoInMemory = {};
  cache.set('monitoramento', {});
}

async function ensureDataDir() {
  if (isVercel) return;
  
  try {
    await fsPromises.access(DATA_DIR);
  } catch {
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function lerArquivo<T>(nomeArquivo: string): Promise<T> {
  const cacheKey = nomeArquivo.replace('.json', '');
  const cached = cache.get(cacheKey);
  if (cached !== undefined) {
    return cached as T;
  }
  try {
    await ensureDataDir();
    const caminho = path.join(DATA_DIR, nomeArquivo);
    
    try {
      await fsPromises.access(caminho);
    } catch {
      if (nomeArquivo === 'monitoramento.json') {
        return {} as T;
      }
      return [] as T;
    }
    
    const conteudo = await fsPromises.readFile(caminho, 'utf-8');
    const parsed = JSON.parse(conteudo);
    cache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error(`Erro ao ler arquivo ${nomeArquivo}:`, error);
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
  const cacheKey = nomeArquivo.replace('.json', '');
  cache.set(cacheKey, dados);
  try {
    await ensureDataDir();
    const caminho = path.join(DATA_DIR, nomeArquivo);
    await fsPromises.writeFile(caminho, JSON.stringify(dados, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${nomeArquivo}:`, error);
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