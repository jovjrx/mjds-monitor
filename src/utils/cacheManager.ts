import NodeCache from 'node-cache';

// Cache em memória (funciona na Vercel serverless)
const cache = new NodeCache({ stdTTL: 0 }); // Sem expiração automática

const CACHE_KEYS = {
  SITES: 'sites',
  TIPOS: 'tipos',
  OFFLINE_HISTORY: 'offline_history',
  SLOW_HISTORY: 'slow_history'
};

// ==================== INTERFACES ====================

export interface Site {
  id: string;
  url: string;
  nome: string;
  tipo_id: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Tipo {
  id: number;
  nome: string;
  cor: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfflineHistoryEntry {
  id: string;
  siteId: string;
  siteName: string;
  url: string;
  statusCode?: number;
  error?: string;
  wentOfflineAt: string;
  wentOnlineAt?: string;
  duration?: number;
}

export interface SlowHistoryEntry {
  id: string;
  siteId: string;
  siteName: string;
  url: string;
  responseTime: number;
  timestamp: string;
}

// ==================== UTILITÁRIOS ====================

export const gerarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Lê arquivo JSON (apenas leitura - funciona na Vercel)
const readJSONFile = <T>(filename: string, defaultValue: T): T => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', filename);
    
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`[CacheManager] Erro ao ler ${filename}:`, error);
    return defaultValue;
  }
};

// ==================== SITES (apenas leitura do JSON) ====================

export const obterSites = async (): Promise<Site[]> => {
  try {
    // Tenta obter do cache primeiro
    const cachedSites = cache.get<Site[]>(CACHE_KEYS.SITES);
    if (cachedSites && cachedSites.length > 0) {
      return cachedSites;
    }
    
    // Lê do arquivo JSON (apenas leitura)
    const sites = readJSONFile<Site[]>('sites.json', []);
    
    // Atualiza o cache
    if (sites.length > 0) {
      cache.set(CACHE_KEYS.SITES, sites);
    }
    
    return sites;
  } catch (error) {
    console.error('[CacheManager] Erro ao obter sites:', error);
    return [];
  }
};

// Adicionar site - apenas em memória (para a sessão atual)
export const adicionarSite = async (site: Site): Promise<void> => {
  const sites = await obterSites();
  sites.push(site);
  cache.set(CACHE_KEYS.SITES, sites);
};

// Atualizar site - apenas em memória
export const atualizarSite = async (id: string, dados: Partial<Site>): Promise<Site> => {
  const sites = await obterSites();
  const siteIndex = sites.findIndex(site => site.id === id);
  
  if (siteIndex === -1) {
    throw new Error('Site não encontrado');
  }
  
  sites[siteIndex] = { ...sites[siteIndex], ...dados };
  cache.set(CACHE_KEYS.SITES, sites);
  
  return sites[siteIndex];
};

// Remover site - apenas em memória
export const removerSite = async (id: string): Promise<void> => {
  const sites = await obterSites();
  const siteIndex = sites.findIndex(site => site.id === id);
  
  if (siteIndex === -1) {
    throw new Error('Site não encontrado');
  }
  
  sites.splice(siteIndex, 1);
  cache.set(CACHE_KEYS.SITES, sites);
};

// ==================== TIPOS (apenas leitura do JSON) ====================

const TIPOS_PADRAO: Tipo[] = [
  { id: 1, nome: 'Institucional', cor: '#3182ce', descricao: 'Sites institucionais e corporativos' },
  { id: 2, nome: 'Área restrita', cor: '#38a169', descricao: 'Área restrita do participante' },
  { id: 3, nome: 'Sistema', cor: '#805ad5', descricao: 'Sistema de gestão' }
];

export const obterTipos = async (): Promise<Tipo[]> => {
  try {
    // Tenta obter do cache primeiro
    const cachedTipos = cache.get<Tipo[]>(CACHE_KEYS.TIPOS);
    if (cachedTipos && cachedTipos.length > 0) {
      return cachedTipos;
    }
    
    // Lê do arquivo JSON (apenas leitura)
    const tipos = readJSONFile<Tipo[]>('tipos.json', TIPOS_PADRAO);
    
    // Atualiza o cache
    cache.set(CACHE_KEYS.TIPOS, tipos);
    
    return tipos.length > 0 ? tipos : TIPOS_PADRAO;
  } catch (error) {
    console.error('[CacheManager] Erro ao obter tipos:', error);
    return TIPOS_PADRAO;
  }
};

// Adicionar tipo - apenas em memória
export const adicionarTipo = async (tipo: Tipo): Promise<void> => {
  const tipos = await obterTipos();
  tipos.push(tipo);
  cache.set(CACHE_KEYS.TIPOS, tipos);
};

// Atualizar tipo - apenas em memória
export const atualizarTipo = async (id: string, dados: Partial<Tipo>): Promise<Tipo> => {
  const tipos = await obterTipos();
  const tipoIndex = tipos.findIndex(tipo => String(tipo.id) === String(id));
  
  if (tipoIndex === -1) {
    throw new Error('Tipo não encontrado');
  }
  
  tipos[tipoIndex] = { ...tipos[tipoIndex], ...dados };
  cache.set(CACHE_KEYS.TIPOS, tipos);
  
  return tipos[tipoIndex];
};

// Remover tipo - apenas em memória
export const removerTipo = async (id: string): Promise<void> => {
  const tipos = await obterTipos();
  const tipoIndex = tipos.findIndex(tipo => String(tipo.id) === String(id));
  
  if (tipoIndex === -1) {
    throw new Error('Tipo não encontrado');
  }
  
  tipos.splice(tipoIndex, 1);
  cache.set(CACHE_KEYS.TIPOS, tipos);
};

// ==================== HISTÓRICO OFFLINE (apenas memória) ====================

export const obterOfflineHistory = async (): Promise<OfflineHistoryEntry[]> => {
  const history = cache.get<OfflineHistoryEntry[]>(CACHE_KEYS.OFFLINE_HISTORY);
  return history || [];
};

export const salvarOfflineHistory = async (history: OfflineHistoryEntry[]): Promise<void> => {
  cache.set(CACHE_KEYS.OFFLINE_HISTORY, history);
};

export const adicionarOfflineHistory = async (entry: OfflineHistoryEntry): Promise<void> => {
  const history = await obterOfflineHistory();
  history.unshift(entry);
  
  // Mantém apenas os últimos 100 registros
  if (history.length > 100) {
    history.splice(100);
  }
  
  await salvarOfflineHistory(history);
};

export const atualizarOfflineHistory = async (id: string, dados: Partial<OfflineHistoryEntry>): Promise<void> => {
  const history = await obterOfflineHistory();
  const index = history.findIndex(entry => entry.id === id);
  
  if (index !== -1) {
    history[index] = { ...history[index], ...dados };
    await salvarOfflineHistory(history);
  }
};

// ==================== HISTÓRICO SLOW (apenas memória) ====================

export const obterSlowHistory = async (): Promise<SlowHistoryEntry[]> => {
  const history = cache.get<SlowHistoryEntry[]>(CACHE_KEYS.SLOW_HISTORY);
  return history || [];
};

export const salvarSlowHistory = async (history: SlowHistoryEntry[]): Promise<void> => {
  cache.set(CACHE_KEYS.SLOW_HISTORY, history);
};

export const adicionarSlowHistory = async (entry: SlowHistoryEntry): Promise<void> => {
  const history = await obterSlowHistory();
  history.unshift(entry);
  
  // Mantém apenas os últimos 100 registros
  if (history.length > 100) {
    history.splice(100);
  }
  
  await salvarSlowHistory(history);
};

// ==================== UTILITÁRIOS DE CACHE ====================

export const limparCache = (): void => {
  cache.flushAll();
};

export const getCacheStats = () => {
  return cache.getStats();
};

export const invalidarCache = (key?: string): void => {
  if (key) {
    cache.del(key);
  } else {
    cache.flushAll();
  }
};
