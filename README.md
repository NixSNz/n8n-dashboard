Um dashboard tipo *WhatsApp* para visualizar mensagens de clientes armazenadas no Supabase.

## Setup

Crie um arquivo `.env` baseado em `.env.example` com as credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Funcionalidades

- Seleção rápida de cliente (tabela) e busca por nome ou número.
- Lista de contatos deduplicados por número, mostrando prévia da última mensagem e horário relativo.
- Visualização do chat com bolhas de mensagens de usuário e agente, agrupadas por dia.
- Atualização em tempo real de novas mensagens.

## Tecnologias

- [Next.js](https://nextjs.org) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase JS](https://supabase.com/docs/reference/javascript)

## License

MIT
