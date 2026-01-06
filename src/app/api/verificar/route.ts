import { NextRequest, NextResponse } from 'next/server';
import { verificarSite } from '@/utils/verificarSite';
import { obterSites, adicionarOfflineHistory, adicionarSlowHistory, obterOfflineHistory, atualizarOfflineHistory, gerarId } from '@/utils/cacheManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId } = body;

    if (siteId) {
      // Verificação individual
      const sites = await obterSites();
      const site = sites.find(s => s.id === siteId);
      
      if (!site) {
        return NextResponse.json(
          { success: false, error: 'Site não encontrado' },
          { status: 404 }
        );
      }

      const status = await verificarSite(site);
      
      // Gerencia histórico de offline
      await gerenciarHistoricoOffline(site, status);
      
      // Adiciona ao histórico de slow se necessário
      if (status.status === 'slow') {
        await adicionarSlowHistory({
          id: gerarId(),
          siteId: site.id,
          siteName: site.nome,
          url: site.url,
          timestamp: new Date().toISOString(),
          responseTime: status.responseTime
        });
      }

      return NextResponse.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } else {
      // Verificação completa
      const sites = await obterSites();
      const resultados: Record<string, any> = {};

      for (const site of sites) {
        try {
          const status = await verificarSite(site);
          resultados[site.id] = status;
          
          // Gerencia histórico de offline
          await gerenciarHistoricoOffline(site, status);
          
          // Adiciona ao histórico de slow se necessário
          if (status.status === 'slow') {
            await adicionarSlowHistory({
              id: gerarId(),
              siteId: site.id,
              siteName: site.nome,
              url: site.url,
              timestamp: new Date().toISOString(),
              responseTime: status.responseTime
            });
          }
        } catch (error) {
          console.error(`Erro ao verificar site ${site.nome}:`, error);
          resultados[site.id] = {
            id: site.id,
            url: site.url,
            nome: site.nome,
            tipo_id: site.tipo_id,
            status: 'offline',
            statusCode: 0,
            responseTime: 0,
            lastChecked: new Date().toISOString(),
            error: 'Erro na verificação'
          };
        }
      }

      return NextResponse.json({
        success: true,
        data: resultados,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erro na verificação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Gerencia o histórico de offline:
 * - Se o site ficou offline, cria um novo registro
 * - Se o site voltou online, atualiza o registro existente com a data de volta
 */
async function gerenciarHistoricoOffline(site: any, status: any) {
  const history = await obterOfflineHistory();
  
  // Procura se existe um registro aberto (sem wentOnlineAt) para este site
  const registroAberto = history.find(
    entry => entry.siteId === site.id && !entry.wentOnlineAt
  );
  
  if (status.status === 'offline') {
    // Site está offline
    if (!registroAberto) {
      // Não existe registro aberto, cria um novo
      await adicionarOfflineHistory({
        id: gerarId(),
        siteId: site.id,
        siteName: site.nome,
        url: site.url,
        statusCode: status.statusCode,
        error: status.error,
        wentOfflineAt: new Date().toISOString(),
      });
    }
    // Se já existe registro aberto, não faz nada (continua offline)
  } else {
    // Site está online (ou slow, rate_limited, etc.)
    if (registroAberto) {
      // Existe registro aberto, fecha ele
      const wentOnlineAt = new Date().toISOString();
      const wentOfflineAt = new Date(registroAberto.wentOfflineAt).getTime();
      const duration = Math.floor((Date.now() - wentOfflineAt) / 1000); // duração em segundos
      
      await atualizarOfflineHistory(registroAberto.id, {
        wentOnlineAt,
        duration
      });
    }
  }
}
