import { NextResponse } from 'next/server';
import { OfflineHistoryManager } from '@/utils/offlineHistory';
import { SlowHistoryManager } from '@/utils/slowHistory';

export async function GET(request: Request, context: any) {
  const { type } = context.params;
  let text = '';

  if (type === 'offline') {
    const manager = new OfflineHistoryManager();
    const history = manager.getOfflineHistory();
    text = history.map(h => `${h.siteName} ${h.url} - offline em ${h.wentOfflineAt}` + (h.wentOnlineAt ? ` voltou ${h.wentOnlineAt}` : '')).join('\n');
  } else if (type === 'slow') {
    const manager = new SlowHistoryManager();
    const history = manager.getSlowHistory();
    text = history.map(h => `${h.siteName} ${h.url} - ${h.responseTime}ms em ${h.timestamp}`).join('\n');
  } else {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  }

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${type}_log.txt"`
    }
  });
}
