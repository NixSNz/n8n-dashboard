'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { fetchContacts, fetchChat, subscribeToTable, Message, Contact } from '@/lib/api';
import { CLIENTES } from '@/lib/clients';
import { fmtNumero, timeAgo, dayLabel } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';

export default function Home() {
  const [cliente, setCliente] = useState(CLIENTES[0]);
  const [contatos, setContatos] = useState<Contact[]>([]);
  const [busca, setBusca] = useState('');
  const [selectedNumero, setSelectedNumero] = useState<string | null>(null);
  const [chat, setChat] = useState<Message[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const loadContatos = useCallback(async () => {
    try {
      setLoadingContacts(true);
      const data = await fetchContacts(cliente.tabela);
      setContatos(data);
    } catch {
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoadingContacts(false);
    }
  }, [cliente]);

  const loadChat = useCallback(
    async (numero: string) => {
      try {
        setLoadingChat(true);
        const data = await fetchChat(cliente.tabela, numero);
        setChat(data);
      } catch {
        toast.error('Erro ao carregar chat');
      } finally {
        setLoadingChat(false);
      }
    },
    [cliente]
  );

  useEffect(() => {
    loadContatos();
  }, [loadContatos]);

  useEffect(() => {
    if (!selectedNumero) return;
    loadChat(selectedNumero);
    const unsub = subscribeToTable(cliente.tabela, row => {
      if (row.numero === selectedNumero) {
        setChat(prev => [...prev, row]);
      } else {
        loadContatos();
      }
    });
    return unsub;
  }, [selectedNumero, cliente, loadChat, loadContatos]);

  const contatosFiltrados = contatos.filter(c =>
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || c.numero.includes(busca)
  );

  function handleSelectContact(numero: string) {
    setSelectedNumero(numero);
  }

  return (
    <>
      <Toaster />
      <div className="flex h-screen">
        <div className="w-72 border-r flex flex-col">
          <div className="p-2 border-b flex gap-2">
            <select
              value={cliente.id}
              onChange={e => {
                const c = CLIENTES.find(c => c.id === e.target.value)!;
                setCliente(c);
                setSelectedNumero(null);
              }}
              className="border rounded px-2 py-1"
            >
              {CLIENTES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar"
              className="flex-1 border rounded px-2 py-1"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <p className="p-4">Carregando...</p>
            ) : (
              contatosFiltrados.map(c => (
                <div
                  key={c.numero}
                  onClick={() => handleSelectContact(c.numero)}
                  className={`p-3 cursor-pointer border-b hover:bg-gray-50 ${selectedNumero === c.numero ? 'bg-gray-100' : ''}`}
                >
                  <div className="font-semibold">{c.nome || fmtNumero(c.numero)}</div>
                  <div className="text-sm text-gray-600 truncate">{c.ultima_msg}</div>
                  <div className="text-xs text-gray-500">{timeAgo(c.ultima_data)}</div>
                </div>
              ))
            )}
            {!loadingContacts && contatosFiltrados.length === 0 && (
              <p className="p-4 text-sm text-gray-500">Nenhum contato</p>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          {selectedNumero ? (
            <>
              <div className="p-4 border-b">
                {(() => {
                  const contato = contatos.find(c => c.numero === selectedNumero);
                  return (
                    <div className="font-semibold">
                      {contato?.nome || fmtNumero(selectedNumero)}
                      {contato?.nome && (
                        <span className="text-gray-600 text-sm ml-2">
                          {fmtNumero(selectedNumero)}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingChat ? (
                  <p>Carregando...</p>
                ) : chat.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma mensagem</p>
                ) : (
                  <ChatList messages={chat} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Selecione um contato
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ChatList({ messages }: { messages: Message[] }) {
  const items: React.ReactElement[] = [];
  let lastDay: string | null = null;
  messages.forEach(m => {
    const day = dayLabel(m.created_at);
    if (day !== lastDay) {
      items.push(
        <div key={`day-${day}-${m.id}`} className="text-center text-xs text-gray-500 my-2">
          {day}
        </div>
      );
      lastDay = day;
    }
    const text = m.mensagem_usuario || m.mensagem_agente || '';
    const isUser = !!m.mensagem_usuario;
    items.push(
      <div key={m.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
        <div className={`px-3 py-2 rounded-lg max-w-xs ${isUser ? 'bg-gray-200' : 'bg-green-200'}`}>
          {text}
        </div>
      </div>
    );
  });
  return <>{items}</>;
}
