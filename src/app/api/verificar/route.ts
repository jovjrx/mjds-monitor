import { NextRequest, NextResponse } from 'next/server';
import { obterSites, salvarMonitoramento } from '../../../../utils/fileManager';
import { verificarTodosSites } from '../../../../utils/verificarSite';

export async function GET() {
  try {
    console.log('Iniciando verificação de sites...');
    const sites = await obterSites();
    console.log('Sites para verificar:', sites);
    
    if (sites.length === 0) {
      console.log('Nenhum site encontrado para verificar');
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Nenhum site cadastrado para verificar',
        timestamp: new Date().toISOString()
      });
    }
    
    const resultados = await verificarTodosSites(sites);
    console.log('Resultados da verificação:', resultados);
    
    // Converter para formato de monitoramento
    const monitoramento: Record<string, any> = {};
    resultados.forEach(resultado => {
      monitoramento[resultado.id] = resultado;
    });
    
    // Salvar no arquivo
    await salvarMonitoramento(monitoramento);
    
    return NextResponse.json({ 
      success: true, 
      data: resultados,
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