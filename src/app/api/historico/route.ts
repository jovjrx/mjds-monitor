import { NextRequest, NextResponse } from 'next/server';
import { obterOfflineHistory, OfflineHistoryEntry } from '@/utils/cacheManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let history = await obterOfflineHistory();
    
    // Filtra por site se especificado
    if (siteId) {
      history = history.filter(entry => entry.siteId === siteId);
    }
    
    // Calcula estatísticas
    const stats = calcularEstatisticas(history);
    
    // Limita o número de resultados
    history = history.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: history,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erro ao obter histórico:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function calcularEstatisticas(history: OfflineHistoryEntry[]) {
  const totalIncidents = history.length;
  const currentOffline = history.filter(entry => !entry.wentOnlineAt).length;
  
  // Calcula tempo total offline (em segundos)
  const totalOfflineTime = history.reduce((total, entry) => {
    if (entry.duration) {
      return total + entry.duration;
    }
    // Se ainda está offline, calcula desde quando ficou offline
    if (!entry.wentOnlineAt && entry.wentOfflineAt) {
      const offlineAt = new Date(entry.wentOfflineAt).getTime();
      const now = Date.now();
      return total + Math.floor((now - offlineAt) / 1000);
    }
    return total;
  }, 0);
  
  // Calcula tempo médio de downtime
  const resolvedIncidents = history.filter(entry => entry.duration);
  const averageDowntime = resolvedIncidents.length > 0
    ? Math.floor(resolvedIncidents.reduce((sum, entry) => sum + (entry.duration || 0), 0) / resolvedIncidents.length)
    : 0;
  
  return {
    totalIncidents,
    currentOffline,
    totalOfflineTime,
    averageDowntime
  };
}
