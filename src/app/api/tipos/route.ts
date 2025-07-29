import { NextRequest, NextResponse } from 'next/server';
import { obterTipos, adicionarTipo, atualizarTipo, removerTipo } from '@/utils/cacheManager';
import { Tipo } from '@/utils/supabase';

export async function GET() {
  try {
    const tipos = await obterTipos();
    return NextResponse.json({ success: true, data: tipos });
  } catch (error: any) {
    console.error('Erro ao obter tipos:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { nome, descricao } = body;
    
    if (!nome) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    const novoTipo: Tipo = {
      id: Date.now(),
      nome,
      cor: body.cor || '#000000',
      descricao: descricao || ''
    };
    
    await adicionarTipo(novoTipo);
      
    return NextResponse.json({ success: true, data: novoTipo });
  } catch (error: any) {
    console.error('Erro ao adicionar tipo:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório' },
        { status: 400 }
      );
    }
    
    await removerTipo(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao remover tipo:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...dados } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const tipoAtualizado = await atualizarTipo(id, dados);

    if (!tipoAtualizado) {
      return NextResponse.json(
        { success: false, error: 'Tipo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tipoAtualizado });
  } catch (error: any) {
    console.error('Erro ao atualizar tipo:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}