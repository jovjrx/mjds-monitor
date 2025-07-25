import { NextRequest, NextResponse } from 'next/server';
import { OfflineHistoryManager } from '../../../../utils/offlineHistory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const historyManager = new OfflineHistoryManager();
    
    let history;
    
    if (startDate && endDate) {
      history = historyManager.getOfflineHistoryByDateRange(startDate, endDate);
    } else if (siteId) {
      history = historyManager.getOfflineHistory(siteId);
    } else {
      history = historyManager.getOfflineHistory();
    }
    
     history = history.slice(0, limit);
    
    const stats = historyManager.getOfflineStats();
    
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