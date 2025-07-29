import { NextRequest, NextResponse } from 'next/server';
import { verificarSite } from '@/utils/verificarSite';
import { obterSites } from '@/utils/cacheManager';
import { adicionarOfflineHistory, adicionarSlowHistory } from '@/utils/cacheManager';

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
      
      // Adiciona ao histórico se necessário
      if (status.status === 'offline') {
        await adicionarOfflineHistory({
          siteId: site.id,
          siteName: site.nome,
          url: site.url,
          timestamp: new Date().toISOString(),
          error: status.error
        });
      } else if (status.status === 'slow') {
        await adicionarSlowHistory({
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
          
          // Adiciona ao histórico se necessário
          if (status.status === 'offline') {
            await adicionarOfflineHistory({
              siteId: site.id,
              siteName: site.nome,
              url: site.url,
              timestamp: new Date().toISOString(),
              error: status.error
            });
          } else if (status.status === 'slow') {
            await adicionarSlowHistory({
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