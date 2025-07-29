import axios from 'axios';
import { Site } from './supabase';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
];

const getRealisticHeaders = () => {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  return {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8,es;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  };
};

export interface SiteStatus {
  id: string;
  url: string;
  nome: string;
  tipo_id: number;
  status: 'online' | 'offline' | 'rate_limited' | 'slow' | 'verificando' | 'aguardando';
  statusCode: number;
  cdnVersion?: string;
  cdnLink?: string;
  cacheControl?: string;
  lastModified?: string;
  responseTime: number;
  lastChecked: string;
  error?: string;
  isAzureFrontDoor?: boolean;
  isUsingCache?: boolean;
  cacheAge?: number;
  cacheMaxAge?: number;
}

const verificarConectividade = async (url: string): Promise<boolean> => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const dns = require('dns').promises;
    await dns.lookup(hostname);
    return true;
  } catch {
    return false;
  }
};

const detectarProtecaoAntiBot = (headers: any, statusCode: number, html?: string): boolean => {
  const indicadores = [
    headers['cf-ray'] || headers['CF-Ray'],
    headers['cf-cache-status'] || headers['CF-Cache-Status'],
    headers['server']?.toLowerCase().includes('cloudflare'),
    headers['via']?.toLowerCase().includes('cloudflare'),
    statusCode === 403,
    statusCode === 503,
    statusCode === 429,
    html?.toLowerCase().includes('cloudflare'),
    html?.toLowerCase().includes('checking your browser'),
    html?.toLowerCase().includes('ddos protection'),
    html?.toLowerCase().includes('security check'),
    html?.toLowerCase().includes('captcha'),
  ];
  return indicadores.some(Boolean);
};

const detectarAzureFrontDoor = (headers: any): boolean => {
  const xAzureRef = headers['x-azure-ref'] || headers['X-Azure-Ref'];
  const xMsRef = headers['x-ms-ref'] || headers['X-Ms-Ref'];
  const server = headers['server'] || headers['Server'];
  const via = headers['via'] || headers['Via'];

  return !!(xAzureRef || xMsRef ||
    (server && server.toLowerCase().includes('azure')) ||
    (via && via.toLowerCase().includes('azure')));
};

const detectarCDNMJDS = (html: string): { provider?: string; isUsingCDN: boolean; version?: string; link?: string } => {
  if (!html || typeof html !== 'string') return { isUsingCDN: false };

  const cdnDomains = ['cdn.mjds.com.br', 'ca.mjds.com.br', 'cs.mjds.com.br'];
  
  for (const domain of cdnDomains) {
    if (html.includes(domain)) {
      const urlPatterns = [
        new RegExp(`https?://${domain.replace(/\./g, '\\.')}[^"'\s]+`, 'gi'),
        new RegExp(`//${domain.replace(/\./g, '\\.')}[^"'\s]+`, 'gi'),
        new RegExp(`${domain.replace(/\./g, '\\.')}[^"'\s]+`, 'gi')
      ];
      
      let urlMatches: RegExpMatchArray | null = null;
      let matchedPattern = '';
      
      for (const pattern of urlPatterns) {
        urlMatches = html.match(pattern);
        if (urlMatches && urlMatches.length > 0) {
          matchedPattern = urlMatches[0];
          break;
        }
      }
      
      if (urlMatches && urlMatches.length > 0) {
        const versionPatterns = [
          /[?&]v=([^"'\s&]+)/i,
          /[?&]version=([^"'\s&]+)/i,
          /[?&]ver=([^"'\s&]+)/i,
          /\/([^\/\s]+\.(?:css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot))[?&]v=([^"'\s&]+)/i,
          /v(\d{6})/i,
          /[?&]v(\d{6})/i
        ];
        
        let version = 'Padrão';
        for (const vPattern of versionPatterns) {
          const versionMatch = matchedPattern.match(vPattern);
          if (versionMatch && versionMatch[1]) {
            version = versionMatch[1];
            break;
          }
        }
        
        let fullUrl = matchedPattern;
        if (!fullUrl.startsWith('http')) {
          fullUrl = `https:${fullUrl}`;
        }
        
        return {
          provider: 'MJDS CDN',
          isUsingCDN: true,
          version,
          link: fullUrl
        };
      }
      
      return {
        provider: 'MJDS CDN',
        isUsingCDN: true,
        version: 'Detectado',
        link: `https://${domain}`
      };
    }
  }
  
  return { isUsingCDN: false };
};

const detectarCache = (headers: any): boolean => {
  const age = headers['age'] || headers['Age'];
  const xCache = headers['x-cache'] || headers['X-Cache'];
  const cfCacheStatus = headers['cf-cache-status'] || headers['CF-Cache-Status'];
  const cacheControl = headers['cache-control'] || headers['Cache-Control'];

  return !!(age || xCache || cfCacheStatus ||
    (cacheControl && cacheControl.includes('max-age')));
};

const extrairInfoCache = (headers: any): { cacheAge?: number; cacheMaxAge?: number } => {
  const age = headers['age'] || headers['Age'];
  const cacheControl = headers['cache-control'] || headers['Cache-Control'];

  let cacheAge: number | undefined;
  let cacheMaxAge: number | undefined;

  if (age) {
    cacheAge = parseInt(age);
  }

  if (cacheControl) {
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      cacheMaxAge = parseInt(maxAgeMatch[1]);
    }
  }

  return { cacheAge, cacheMaxAge };
};

export async function verificarSite(site: Site, slowTimeout = 10000, offlineTimeout = 30000): Promise<SiteStatus> {
  const startTime = Date.now();
  const lastChecked = new Date().toISOString();
  const headers = getRealisticHeaders();

  try {
    const temConectividade = await verificarConectividade(site.url);
    if (!temConectividade) {
      throw new Error('DNS não resolve');
    }

    const response = await axios.get(site.url, {
      timeout: offlineTimeout,
      maxRedirects: 5,
      validateStatus: () => true,
      headers,
    });

    const responseTime = Date.now() - startTime;
    const temProtecaoAntiBot = detectarProtecaoAntiBot(response.headers, response.status);
    const isAzureFrontDoor = detectarAzureFrontDoor(response.headers);

    const mjdsCdnInfo = detectarCDNMJDS(response.data);

    let status: 'online' | 'offline' | 'rate_limited' | 'slow' = 'online';

    if (temProtecaoAntiBot) {
      status = 'rate_limited';
    } else if (response.status >= 400) {
      if (response.status === 429) {
        status = 'rate_limited';
      } else {
        status = 'offline';
      }
    }

    if (slowTimeout > offlineTimeout) {
      console.warn(`[Warning] ${site.url} - slowTimeout (${slowTimeout}ms) > offlineTimeout (${offlineTimeout}ms). Isso pode causar problemas na lógica.`);
    }

    if (status === 'online' && responseTime >= slowTimeout) {
      status = 'slow';
    } else if (status === 'online' && responseTime >= offlineTimeout) {
      status = 'offline';
    }

    return {
      id: site.id,
      url: site.url,
      nome: site.nome,
      tipo_id: site.tipo_id,
      status,
      statusCode: response.status,
      cdnVersion: mjdsCdnInfo.version,
      cdnLink: mjdsCdnInfo.link,
      cacheControl: response.headers['cache-control'] || response.headers['Cache-Control'],
      lastModified: response.headers['last-modified'] || response.headers['Last-Modified'] || response.headers['date'] || response.headers['Date'],
      responseTime,
      lastChecked,
      isAzureFrontDoor,
      isUsingCache: detectarCache(response.headers),
      ...extrairInfoCache(response.headers),
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    return {
      id: site.id,
      url: site.url,
      nome: site.nome,
      tipo_id: site.tipo_id,
      status: 'offline',
      statusCode: 0,
      responseTime,
      lastChecked,
      error: error.message || 'Erro desconhecido',
      isAzureFrontDoor: false,
      isUsingCache: false,
    };
  }
}