import { NextResponse } from 'next/server';
import { obterMonitoramento } from '@/utils/fileManager';

export async function GET() {
  try {
    const monitoramento = await obterMonitoramento();
    
    return NextResponse.json({ success: true, data: monitoramento });
  } catch (error: any) {
    console.error('Erro ao obter monitoramento:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 