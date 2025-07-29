import { NextRequest, NextResponse } from 'next/server';
import { obterOfflineHistory } from '@/utils/cacheManager';

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
    
    // Limita o número de resultados
    history = history.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: history,
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