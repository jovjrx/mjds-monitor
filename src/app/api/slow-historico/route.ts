import { NextRequest, NextResponse } from 'next/server';
import { SlowHistoryManager } from '@/utils/slowHistory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const historyManager = new SlowHistoryManager();

    let history;
    if (siteId) {
      history = historyManager.getSlowHistory(siteId);
    } else {
      history = historyManager.getSlowHistory();
    }

    history = history.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao obter histórico de lentidão:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
