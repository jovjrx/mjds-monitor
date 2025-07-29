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

export const obterSites = async (): Promise<Site[]> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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

export const obterTipos = async (): Promise<Tipo[]> => {
  try {
    const { data, error } = await supabase
      .from('tipos')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error('[Supabase] Erro ao obter tipos:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('[Supabase] Erro ao conectar:', error);
    return [];
  }
};


export const adicionarTipo = async (tipo: Tipo): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tipos')
      .insert(tipo);
    
    if (error) {
      console.error('[Supabase] Erro ao adicionar tipo:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('[Supabase] Erro ao adicionar tipo:', error);
    throw error;
  }
};

export const atualizarTipo = async (id: string, dados: Partial<Tipo>): Promise<Tipo> => {
  try {
    const { data, error } = await supabase
      .from('tipos')
      .update(dados)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase] Erro ao atualizar tipo:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[Supabase] Erro ao atualizar tipo:', error);
    throw error;
  }
};

export const removerTipo = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tipos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('[Supabase] Erro ao remover tipo:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('[Supabase] Erro ao remover tipo:', error);
    throw error;
  }
};

export const obterOfflineHistory = async (): Promise<any[]> => {
  const history = cache.get(CACHE_KEYS.OFFLINE_HISTORY);
  return (history as any[]) || [];
};

export const salvarOfflineHistory = async (history: any[]): Promise<void> => {
  cache.set(CACHE_KEYS.OFFLINE_HISTORY, history);
};

export const adicionarOfflineHistory = async (entry: any): Promise<void> => {
  const history = await obterOfflineHistory();
  history.unshift(entry);
  if (history.length > 100) {
    history.splice(100);
  }
  await salvarOfflineHistory(history);
};

export const obterSlowHistory = async (): Promise<any[]> => {
  const history = cache.get(CACHE_KEYS.SLOW_HISTORY);
  return (history as any[]) || [];
};

export const salvarSlowHistory = async (history: any[]): Promise<void> => {
  cache.set(CACHE_KEYS.SLOW_HISTORY, history);
};

export const adicionarSlowHistory = async (entry: any): Promise<void> => {
  const history = await obterSlowHistory();
  history.unshift(entry);
  if (history.length > 100) {
    history.splice(100);
  }
  await salvarSlowHistory(history);
};

export const limparCache = (): void => {
  cache.flushAll(); 
};

export const getCacheStats = () => {
  return cache.getStats();
}; 