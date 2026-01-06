// Interfaces para compatibilidade (dados agora são armazenados localmente em JSON)

export interface Site {
  id: string;
  url: string;
  nome: string;
  tipo_id: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Tipo {
  id: number;
  nome: string;
  cor: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

// Exporta um objeto vazio para manter compatibilidade com imports existentes
// O sistema agora usa armazenamento local em JSON
export const supabase = null;

export default supabase;
