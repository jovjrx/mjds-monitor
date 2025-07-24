import { NextRequest, NextResponse } from 'next/server';
import { obterSites, salvarSites, gerarId, atualizarSite } from '../../../../utils/fileManager';
import { Site } from '../../../../utils/verificarSite';

export async function GET() {
  try {
    const sites = await obterSites();
    return NextResponse.json({ success: true, data: sites });
  } catch (error: any) {
    console.error('Erro ao obter sites:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { url, nome, tipoId } = body;
    
    if (!url || !nome || !tipoId) {
      return NextResponse.json(
        { success: false, error: 'URL, nome e tipo são obrigatórios' },
        { status: 400 }
      );
    }
    
    const sites = await obterSites();
    const novoSite: Site = {
      id: gerarId(),
      url,
      nome,
      tipoId,
      ativo: true
    };
    
    sites.push(novoSite);
    await salvarSites(sites);
    
    return NextResponse.json({ success: true, data: novoSite });
  } catch (error: any) {
    console.error('Erro ao adicionar site:', error);
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
    
    const sites = await obterSites();
    const sitesFiltrados = sites.filter((site: Site) => site.id !== id);
    
    if (sitesFiltrados.length === sites.length) {
      return NextResponse.json(
        { success: false, error: 'Site não encontrado' },
        { status: 404 }
      );
    }
    
    await salvarSites(sitesFiltrados);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao remover site:', error);
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

    const siteAtualizado = await atualizarSite(id, dados);

    if (!siteAtualizado) {
      return NextResponse.json(
        { success: false, error: 'Site não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: siteAtualizado });
  } catch (error: any) {
    console.error('Erro ao atualizar site:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}