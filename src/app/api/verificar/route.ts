import { NextRequest, NextResponse } from 'next/server';
import { obterSites, salvarMonitoramento, obterMonitoramento } from '@/utils/fileManager';
import { verificarTodosSites } from '@/utils/verificarSite';
import { OfflineHistoryManager } from '@/utils/offlineHistory';
import { SlowHistoryManager } from '@/utils/slowHistory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slowTimeout = parseInt(searchParams.get('slowTimeout') || '10000');
    const offlineTimeout = parseInt(searchParams.get('offlineTimeout') || '20000');
    const sites = await obterSites();
    const historyManager = new OfflineHistoryManager();
    const slowHistoryManager = new SlowHistoryManager();
    
    if (sites.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Nenhum site cadastrado para verificar',
        timestamp: new Date().toISOString()
      });
    }
    
    const monitoramentoAnterior = await obterMonitoramento();
    
    const resultados = await verificarTodosSites(sites, slowTimeout, offlineTimeout);

    resultados.forEach(resultado => {
      const statusAnterior = monitoramentoAnterior[resultado.id]?.status;

      if (statusAnterior === 'online' && resultado.status === 'offline') {
        historyManager.siteWentOffline(
          resultado.id,
          resultado.nome,
          resultado.url,
          resultado.statusCode,
          resultado.error
        );
      } else if (statusAnterior === 'offline' && resultado.status === 'online') {
        historyManager.siteWentOnline(resultado.id);
      }

      if (resultado.status === 'slow') {
        slowHistoryManager.recordSlow(
          resultado.id,
          resultado.nome,
          resultado.url,
          resultado.responseTime
        );
      }
    });
    
    const monitoramento: Record<string, any> = {};
    resultados.forEach(resultado => {
      monitoramento[resultado.id] = resultado;
    });
    
    await salvarMonitoramento(monitoramento);
    
    const offlineStats = historyManager.getOfflineStats();
    const currentOfflineSites = historyManager.getCurrentOfflineSites();
    
    return NextResponse.json({ 
      success: true, 
      data: resultados,
      offlineStats,
      currentOfflineSites,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erro na verificação:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 