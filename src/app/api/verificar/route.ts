import { NextRequest, NextResponse } from 'next/server';
import { obterSites, salvarMonitoramento, obterMonitoramento } from '../../../../utils/fileManager';
import { verificarTodosSites } from '../../../../utils/verificarSite';
import { OfflineHistoryManager } from '../../../../utils/offlineHistory';

export async function GET() {
  try {
    const sites = await obterSites();
    const historyManager = new OfflineHistoryManager();
    
    if (sites.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Nenhum site cadastrado para verificar',
        timestamp: new Date().toISOString()
      });
    }
    
    // Obter status anterior para comparação
    const monitoramentoAnterior = await obterMonitoramento();
    
    const resultados = await verificarTodosSites(sites);
    
    // Verificar mudanças de status e registrar no histórico
    resultados.forEach(resultado => {
      const statusAnterior = monitoramentoAnterior[resultado.id]?.status;
      
      if (statusAnterior === 'online' && resultado.status === 'offline') {
        // Site ficou offline - registrar no histórico
        historyManager.siteWentOffline(
          resultado.id,
          resultado.nome,
          resultado.url,
          resultado.statusCode,
          resultado.error
        );
      } else if (statusAnterior === 'offline' && resultado.status === 'online') {
        // Site voltou online - fechar registro no histórico
        historyManager.siteWentOnline(resultado.id); 
      }
    });
    
    // Converter para formato de monitoramento
    const monitoramento: Record<string, any> = {};
    resultados.forEach(resultado => {
      monitoramento[resultado.id] = resultado;
    });
    
    // Salvar no arquivo
    await salvarMonitoramento(monitoramento);
    
    // Obter estatísticas de sites offline
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