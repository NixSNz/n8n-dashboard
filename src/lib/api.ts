import { supabase } from './supabase';

export interface Message {
  id: number;
  nome: string | null;
  numero: string;
  mensagem_usuario: string | null;
  mensagem_agente: string | null;
  created_at: string;
}

export interface Contact {
  numero: string;
  nome: string | null;
  ultima_msg: string;
  ultima_data: string;
}

// Lista contatos deduplicados por numero com a última mensagem.
export async function fetchContacts(table: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from(table)
    .select('numero,nome,mensagem_usuario,mensagem_agente,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  type Row = {
    numero: string;
    nome: string | null;
    mensagem_usuario: string | null;
    mensagem_agente: string | null;
    created_at: string;
  };

  const map = new Map<string, Contact>();
  for (const row of (data as Row[])) {
    if (map.has(row.numero)) continue;
    const text = row.mensagem_usuario || row.mensagem_agente || '';
    map.set(row.numero, {
      numero: row.numero,
      nome: row.nome,
      ultima_msg: text,
      ultima_data: row.created_at,
    });
  }
  return Array.from(map.values());
}

// Mensagens de um contato
export async function fetchChat(table: string, numero: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from(table)
    .select('id,nome,numero,mensagem_usuario,mensagem_agente,created_at')
    .eq('numero', numero)
    .order('created_at', { ascending: true })
    .limit(2000);
  if (error) throw error;
  return (data as Message[]) || [];
}

// Realtime subscription
export function subscribeToTable(table: string, onInsert: (row: Message) => void) {
  const channel = supabase
    .channel(`realtime:${table}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, payload => {
      onInsert(payload.new as Message);
    })
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
