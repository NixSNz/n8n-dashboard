import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const fmtNumero = (n: number | string) => {
  const s = String(n).replace(/\D/g, '');
  const s2 = s.replace(/^55/, '');
  return s2.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
};

export const timeAgo = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
};

export const dayLabel = (date: string) => {
  const d = new Date(date);
  if (isToday(d)) return 'Hoje';
  if (isYesterday(d)) return 'Ontem';
  return format(d, 'dd/MM/yyyy');
};
