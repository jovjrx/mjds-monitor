import axios, { AxiosResponse } from 'axios';

export interface SiteStatus {
  id: string;
  url: string;
  nome: string;
  tipoId: string;
  status: 'online' | 'offline' | 'frontdoor';
  statusCode: number;
  cdnVersion?: string;
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

export async function verificarSite(site: Site): Promise<SiteStatus> {
  const startTime = Date.now();
  const lastChecked = new Date().toISOString();

  try {
    const response: AxiosResponse = await axios.get(site.url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true, // Aceita qualquer status code
    });

    const responseTime = Date.now() - startTime;
    const { status: statusCode, headers, data: html } = response;

    // Determinar status baseado no código de resposta
    let status: 'online' | 'offline' | 'frontdoor' = 'online';
    if (statusCode >= 400) {
      status = statusCode === 403 || statusCode === 503 ? 'frontdoor' : 'offline';
    }

    // Extrair informações dos headers
    const cacheControl = headers['cache-control'] || headers['Cache-Control'];
    const lastModified = headers['last-modified'] || headers['Last-Modified'] || headers['date'] || headers['Date'];
    const age = headers['age'] || headers['Age'];
    const xCache = headers['x-cache'] || headers['X-Cache'];
    const cfCacheStatus = headers['cf-cache-status'] || headers['CF-Cache-Status'];
    const xAzureRef = headers['x-azure-ref'] || headers['X-Azure-Ref'];
    const xMsRef = headers['x-ms-ref'] || headers['X-Ms-Ref'];

    // Verificar se é Azure Front Door
    const isAzureFrontDoor = !!(xAzureRef || xMsRef || 
      (headers['server'] && headers['server'].includes('Azure')) ||
      (headers['via'] && headers['via'].includes('azure')));

    // Verificar se está usando cache
    const isUsingCache = !!(age || xCache || cfCacheStatus || 
      (cacheControl && cacheControl.includes('max-age')));

    // Calcular tempo de cache
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

    // Verificar CDN no HTML
    const cdnVersion = extrairVersaoCDN(html);

    return {
      id: site.id,
      url: site.url,
      nome: site.nome,
      tipoId: site.tipoId,
      status,
      statusCode,
      cdnVersion,
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

function extrairVersaoCDN(html: string): string | undefined {
  if (!html || typeof html !== 'string') return undefined;

  // Padrões para detectar CDN MJDS
  const cdnPatterns = [
    /cdn\.mjds\.com\.br\/([^"'\s]+)/gi,
    /ca\.mjds\.com\.br\/([^"'\s]+)/gi,
    /cdn\.mjds\.com\.br\?v=([^"'\s&]+)/gi,
    /ca\.mjds\.com\.br\?v=([^"'\s&]+)/gi,
  ];

  for (const pattern of cdnPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Verificar se há referência à CDN sem versão específica
  if (html.includes('cdn.mjds.com.br') || html.includes('ca.mjds.com.br')) {
    return 'detectado';
  }

  return undefined;
}

export async function verificarTodosSites(sites: Site[]): Promise<SiteStatus[]> {
  const promises = sites
    .filter(site => site.ativo)
    .map(site => verificarSite(site));

  return Promise.all(promises);
} 