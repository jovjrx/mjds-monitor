import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Variáveis de ambiente não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces para as tabelas
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

export default supabase;