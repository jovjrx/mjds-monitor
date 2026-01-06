import NodeCache from 'node-cache';
import { supabase, Site, Tipo } from './supabase';

const cache = new NodeCache({ stdTTL: 3600 });

const CACHE_KEYS = {
  OFFLINE_HISTORY: 'offline_history',
  SLOW_HISTORY: 'slow_history'
};

export const gerarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ==================== SITES ====================

export const obterSites = async (): Promise<Site[]> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[CacheManager] Supabase não configurado, usando JSON local para sites');
      return await obterSitesFromJSON();
    }

    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error('[Supabase] Erro ao obter sites:', error);
      return await obterSitesFromJSON();
    }
    
    return data || [];
  } catch (error) {
    console.error('[Supabase] Erro ao conectar:', error);
    return await obterSitesFromJSON();
  }
};

const obterSitesFromJSON = async (): Promise<Site[]> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'sites.json');
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const sites = JSON.parse(data);
    return sites;
  } catch (error) {
    console.error('[CacheManager] Erro ao ler sites do JSON:', error);
    return [];
  }
};

export const salvarSites = async (sites: Site[]): Promise<void> => {
};

export const adicionarSite = async (site: Site): Promise<void> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await adicionarSiteToJSON(site);
      return;
    }

    const { error } = await supabase
      .from('sites')
      .insert(site);
    
    if (error) {
      console.error('[Supabase] Erro ao adicionar site:', error);
      await adicionarSiteToJSON(site);
      return;
    }
    
  } catch (error) {
    console.error('[Supabase] Erro ao adicionar site:', error);
    await adicionarSiteToJSON(site);
  }
};

const adicionarSiteToJSON = async (site: Site): Promise<void> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'sites.json');
    
    let sites: Site[] = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      sites = JSON.parse(data);
    }
    
    sites.push(site);
    fs.writeFileSync(filePath, JSON.stringify(sites, null, 2));
  } catch (error) {
    console.error('[CacheManager] Erro ao adicionar site no JSON:', error);
    throw error;
  }
};

export const atualizarSite = async (id: string, dados: Partial<Site>): Promise<Site> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return await atualizarSiteInJSON(id, dados);
    }

    const { data, error } = await supabase
      .from('sites')
      .update(dados)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase] Erro ao atualizar site:', error);
      return await atualizarSiteInJSON(id, dados);
    }

    return data;
  } catch (error) {
    console.error('[Supabase] Erro ao atualizar site:', error);
    return await atualizarSiteInJSON(id, dados);
  }
};

const atualizarSiteInJSON = async (id: string, dados: Partial<Site>): Promise<Site> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'sites.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo sites.json não encontrado');
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const sites: Site[] = JSON.parse(data);
    
    const siteIndex = sites.findIndex(site => site.id === id);
    if (siteIndex === -1) {
      throw new Error('Site não encontrado');
    }
    
    sites[siteIndex] = { ...sites[siteIndex], ...dados };
    fs.writeFileSync(filePath, JSON.stringify(sites, null, 2));
    
    return sites[siteIndex];
  } catch (error) {
    console.error('[CacheManager] Erro ao atualizar site no JSON:', error);
    throw error;
  }
};

export const removerSite = async (id: string): Promise<void> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await removerSiteFromJSON(id);
      return;
    }

    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('[Supabase] Erro ao remover site:', error);
      await removerSiteFromJSON(id);
      return;
    }
    
  } catch (error) {
    console.error('[Supabase] Erro ao remover site:', error);
    await removerSiteFromJSON(id);
  }
};

const removerSiteFromJSON = async (id: string): Promise<void> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'sites.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo sites.json não encontrado');
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const sites: Site[] = JSON.parse(data);
    
    const siteIndex = sites.findIndex(site => site.id === id);
    if (siteIndex === -1) {
      throw new Error('Site não encontrado');
    }
    
    sites.splice(siteIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(sites, null, 2));
    
  } catch (error) {
    console.error('[CacheManager] Erro ao remover site do JSON:', error);
    throw error;
  }
};

// ==================== TIPOS ====================

export const obterTipos = async (): Promise<Tipo[]> => {
  try {
    // Verificar se Supabase está configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[CacheManager] Supabase não configurado, usando JSON local para tipos');
      return await obterTiposFromJSON();
    }

    const { data, error } = await supabase
      .from('tipos')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error('[Supabase] Erro ao obter tipos:', error);
      return await obterTiposFromJSON();
    }
    
    return data || [];
  } catch (error) {
    console.error('[Supabase] Erro ao conectar:', error);
    return await obterTiposFromJSON();
  }
};

const obterTiposFromJSON = async (): Promise<Tipo[]> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'tipos.json');
    
    if (!fs.existsSync(filePath)) {
      // Criar arquivo com tipos padrão se não existir
      const tiposPadrao: Tipo[] = [
        { id: 1, nome: 'Institucional', cor: '#3182ce', descricao: 'Sites institucionais e corporativos' },
        { id: 2, nome: 'Área restrita', cor: '#38a169', descricao: 'Área restrita do participante' },
        { id: 3, nome: 'Sistema', cor: '#805ad5', descricao: 'Sistema de gestão' }
      ];
      fs.writeFileSync(filePath, JSON.stringify(tiposPadrao, null, 2));
      return tiposPadrao;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const tipos = JSON.parse(data);
    return tipos;
  } catch (error) {
    console.error('[CacheManager] Erro ao ler tipos do JSON:', error);
    return [];
  }
};

export const adicionarTipo = async (tipo: Tipo): Promise<void> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await adicionarTipoToJSON(tipo);
      return;
    }

    const { error } = await supabase
      .from('tipos')
      .insert(tipo);
    
    if (error) {
      console.error('[Supabase] Erro ao adicionar tipo:', error);
      await adicionarTipoToJSON(tipo);
      return;
    }
    
  } catch (error) {
    console.error('[Supabase] Erro ao adicionar tipo:', error);
    await adicionarTipoToJSON(tipo);
  }
};

const adicionarTipoToJSON = async (tipo: Tipo): Promise<void> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'tipos.json');
    
    let tipos: Tipo[] = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      tipos = JSON.parse(data);
    }
    
    tipos.push(tipo);
    fs.writeFileSync(filePath, JSON.stringify(tipos, null, 2));
  } catch (error) {
    console.error('[CacheManager] Erro ao adicionar tipo no JSON:', error);
    throw error;
  }
};

export const atualizarTipo = async (id: string, dados: Partial<Tipo>): Promise<Tipo> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return await atualizarTipoInJSON(id, dados);
    }

    const { data, error } = await supabase
      .from('tipos')
      .update(dados)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase] Erro ao atualizar tipo:', error);
      return await atualizarTipoInJSON(id, dados);
    }

    return data;
  } catch (error) {
    console.error('[Supabase] Erro ao atualizar tipo:', error);
    return await atualizarTipoInJSON(id, dados);
  }
};

const atualizarTipoInJSON = async (id: string, dados: Partial<Tipo>): Promise<Tipo> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'tipos.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo tipos.json não encontrado');
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const tipos: Tipo[] = JSON.parse(data);
    
    const tipoIndex = tipos.findIndex(tipo => String(tipo.id) === String(id));
    if (tipoIndex === -1) {
      throw new Error('Tipo não encontrado');
    }
    
    tipos[tipoIndex] = { ...tipos[tipoIndex], ...dados };
    fs.writeFileSync(filePath, JSON.stringify(tipos, null, 2));
    
    return tipos[tipoIndex];
  } catch (error) {
    console.error('[CacheManager] Erro ao atualizar tipo no JSON:', error);
    throw error;
  }
};

export const removerTipo = async (id: string): Promise<void> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await removerTipoFromJSON(id);
      return;
    }

    const { error } = await supabase
      .from('tipos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('[Supabase] Erro ao remover tipo:', error);
      await removerTipoFromJSON(id);
      return;
    }
    
  } catch (error) {
    console.error('[Supabase] Erro ao remover tipo:', error);
    await removerTipoFromJSON(id);
  }
};

const removerTipoFromJSON = async (id: string): Promise<void> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'tipos.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo tipos.json não encontrado');
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const tipos: Tipo[] = JSON.parse(data);
    
    const tipoIndex = tipos.findIndex(tipo => String(tipo.id) === String(id));
    if (tipoIndex === -1) {
      throw new Error('Tipo não encontrado');
    }
    
    tipos.splice(tipoIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(tipos, null, 2));
    
  } catch (error) {
    console.error('[CacheManager] Erro ao remover tipo do JSON:', error);
    throw error;
  }
};

// ==================== HISTÓRICO OFFLINE ====================

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

export const obterOfflineHistory = async (): Promise<OfflineHistoryEntry[]> => {
  try {
    // Primeiro tenta obter do cache em memória
    const cachedHistory = cache.get(CACHE_KEYS.OFFLINE_HISTORY) as OfflineHistoryEntry[];
    if (cachedHistory && cachedHistory.length > 0) {
      return cachedHistory;
    }

    // Se não tem no cache, tenta carregar do arquivo JSON
    const history = await obterOfflineHistoryFromJSON();
    
    // Atualiza o cache em memória
    if (history.length > 0) {
      cache.set(CACHE_KEYS.OFFLINE_HISTORY, history);
    }
    
    return history;
  } catch (error) {
    console.error('[CacheManager] Erro ao obter histórico offline:', error);
    return [];
  }
};

const obterOfflineHistoryFromJSON = async (): Promise<OfflineHistoryEntry[]> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'offline_history.json');
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const history = JSON.parse(data);
    return history;
  } catch (error) {
    console.error('[CacheManager] Erro ao ler histórico offline do JSON:', error);
    return [];
  }
};

export const salvarOfflineHistory = async (history: OfflineHistoryEntry[]): Promise<void> => {
  try {
    // Salva no cache em memória
    cache.set(CACHE_KEYS.OFFLINE_HISTORY, history);
    
    // Salva no arquivo JSON para persistência
    await salvarOfflineHistoryToJSON(history);
  } catch (error) {
    console.error('[CacheManager] Erro ao salvar histórico offline:', error);
  }
};

const salvarOfflineHistoryToJSON = async (history: OfflineHistoryEntry[]): Promise<void> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'offline_history.json');
    
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('[CacheManager] Erro ao salvar histórico offline no JSON:', error);
    throw error;
  }
};

export const adicionarOfflineHistory = async (entry: OfflineHistoryEntry): Promise<void> => {
  const history = await obterOfflineHistory();
  history.unshift(entry);
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

// ==================== HISTÓRICO SLOW ====================

export interface SlowHistoryEntry {
  id: string;
  siteId: string;
  siteName: string;
  url: string;
  responseTime: number;
  timestamp: string;
}

export const obterSlowHistory = async (): Promise<SlowHistoryEntry[]> => {
  try {
    // Primeiro tenta obter do cache em memória
    const cachedHistory = cache.get(CACHE_KEYS.SLOW_HISTORY) as SlowHistoryEntry[];
    if (cachedHistory && cachedHistory.length > 0) {
      return cachedHistory;
    }

    // Se não tem no cache, tenta carregar do arquivo JSON
    const history = await obterSlowHistoryFromJSON();
    
    // Atualiza o cache em memória
    if (history.length > 0) {
      cache.set(CACHE_KEYS.SLOW_HISTORY, history);
    }
    
    return history;
  } catch (error) {
    console.error('[CacheManager] Erro ao obter histórico slow:', error);
    return [];
  }
};

const obterSlowHistoryFromJSON = async (): Promise<SlowHistoryEntry[]> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'slow_history.json');
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const history = JSON.parse(data);
    return history;
  } catch (error) {
    console.error('[CacheManager] Erro ao ler histórico slow do JSON:', error);
    return [];
  }
};

export const salvarSlowHistory = async (history: SlowHistoryEntry[]): Promise<void> => {
  try {
    // Salva no cache em memória
    cache.set(CACHE_KEYS.SLOW_HISTORY, history);
    
    // Salva no arquivo JSON para persistência
    await salvarSlowHistoryToJSON(history);
  } catch (error) {
    console.error('[CacheManager] Erro ao salvar histórico slow:', error);
  }
};

const salvarSlowHistoryToJSON = async (history: SlowHistoryEntry[]): Promise<void> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'slow_history.json');
    
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('[CacheManager] Erro ao salvar histórico slow no JSON:', error);
    throw error;
  }
};

export const adicionarSlowHistory = async (entry: SlowHistoryEntry): Promise<void> => {
  const history = await obterSlowHistory();
  history.unshift(entry);
  if (history.length > 100) {
    history.splice(100);
  }
  await salvarSlowHistory(history);
};

// ==================== UTILITÁRIOS ====================

export const limparCache = (): void => {
  cache.flushAll(); 
};

export const getCacheStats = () => {
  return cache.getStats();
};
