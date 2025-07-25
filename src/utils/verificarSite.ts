import axios, { AxiosResponse } from 'axios';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

export interface SiteStatus {
  id: string;
  url: string;
  nome: string;
  tipoId: string;
  status: 'online' | 'offline' | 'rate_limited' | 'slow';
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

export interface SiteOfflineHistory {
  id: string;
  siteId: string;
  siteName: string;
  url: string;
  wentOfflineAt: string;
  wentOnlineAt?: string;
  duration?: number;
  statusCode?: number;
  error?: string;
}

export interface Site {
  id: string;
  url: string;
  nome: string;
  tipoId: string;
  ativo: boolean;
}

export interface Tipo {
  id: string;
  nome: string;
  descricao: string;
}

export async function verificarSite(site: Site, slowTimeout = 10000, offlineTimeout = 20000): Promise<SiteStatus> {
  const startTime = Date.now();
  const lastChecked = new Date().toISOString();

  try {
    const response: AxiosResponse = await axios.get(site.url, {
      timeout: offlineTimeout,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
      },
    });

    const responseTime = Date.now() - startTime;
    const { status: statusCode, headers, data: html } = response;

    let status: 'online' | 'offline' | 'rate_limited' | 'slow' = 'online';
    if (statusCode >= 400) {
      if (statusCode === 429) {
        status = 'rate_limited';
      } else {
        status = 'offline';
      }
    }

    if (status === 'online' && responseTime >= slowTimeout) {
      status = 'slow';
    }

    const cacheControl = headers['cache-control'] || headers['Cache-Control'];
    const lastModified = headers['last-modified'] || headers['Last-Modified'] || headers['date'] || headers['Date'];
    const age = headers['age'] || headers['Age'];
    const xCache = headers['x-cache'] || headers['X-Cache'];
    const cfCacheStatus = headers['cf-cache-status'] || headers['CF-Cache-Status'];
    const xAzureRef = headers['x-azure-ref'] || headers['X-Azure-Ref'];
    const xMsRef = headers['x-ms-ref'] || headers['X-Ms-Ref'];

    const isAzureFrontDoor = !!(xAzureRef || xMsRef || 
      (headers['server'] && headers['server'].includes('Azure')) ||
      (headers['via'] && headers['via'].includes('azure')));

    const isUsingCache = !!(age || xCache || cfCacheStatus || 
      (cacheControl && cacheControl.includes('max-age')));

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

    const cdnInfo = extrairVersaoCDN(html);

    return {
      id: site.id,
      url: site.url,
      nome: site.nome,
      tipoId: site.tipoId,
      status,
      statusCode,
      cdnVersion: cdnInfo.version,
      cdnLink: cdnInfo.link,
      cacheControl,
      lastModified,
      responseTime,
      lastChecked,
      isAzureFrontDoor,
      isUsingCache,
      cacheAge,
      cacheMaxAge,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      id: site.id,
      url: site.url,
      nome: site.nome,
      tipoId: site.tipoId,
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

function extrairVersaoCDN(html: string): { version?: string; link?: string } {
  if (!html || typeof html !== 'string') return {};

  const cdnPatterns = [
    /(?:cdn|ca|cs)\.mjds\.com\.br\/([^"'\s?]+)/gi,
    /(?:cdn|ca|cs)\.mjds\.com\.br\?v=([^"'\s&]+)/gi,
    /(?:cdn|ca|cs)\.mjds\.com\.br.*?[?&]v=([^"'\s&]+)/gi,
    /(?:cdn|ca|cs)\.mjds\.com\.br\/([^"'\s?]+)\?/gi,
  ];

  for (const pattern of cdnPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      if (match[1].includes('v') && /\bv\d+\b/.test(match[1])) {
        const versionMatch = match[1].match(/\bv\d+\b/);
        if (versionMatch) {
          return {
            version: versionMatch[0],
            link: match[0]
          };
        }
      }
    }
  }

  const cdnDomains = ['cdn.mjds.com.br', 'ca.mjds.com.br', 'cs.mjds.com.br'];
  
  for (const domain of cdnDomains) {
    if (html.includes(domain)) {  
      const urlPattern = new RegExp(`https?://${domain.replace(/\./g, '\\.')}[^"'\s]+`, 'gi');
      const urlMatch = html.match(urlPattern);
      
      return {
        version: 'Padrão',
        link: urlMatch ? urlMatch[0] : `https://${domain}`
      };
    }
  }

  return {};
}

export async function verificarTodosSites(sites: Site[], slowTimeout = 10000, offlineTimeout = 20000): Promise<SiteStatus[]> {
  const promises = sites
    .filter(site => site.ativo)
    .map(site => verificarSite(site, slowTimeout, offlineTimeout));

  return Promise.all(promises);
} 
