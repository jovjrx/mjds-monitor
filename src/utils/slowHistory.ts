import HistoryManager from './historyManager';

export interface SiteSlowHistory {
  id: string;
  siteId: string;
  siteName: string;
  url: string;
  timestamp: string;
  responseTime: number;
}

const HISTORY_CACHE_KEY = 'slow_history';
const HISTORY_FILE = 'slow_history.json';

export class SlowHistoryManager extends HistoryManager<SiteSlowHistory> {
  constructor() {
    super(HISTORY_CACHE_KEY, HISTORY_FILE);
  }

  public recordSlow(siteId: string, siteName: string, url: string, responseTime: number): void {
    const now = new Date().toISOString();
    const record: SiteSlowHistory = {
      id: `${siteId}_${Date.now()}`,
      siteId,
      siteName,
      url,
      timestamp: now,
      responseTime,
    };
    this.addRecord(record);
  }

  public getSlowHistory(siteId?: string): SiteSlowHistory[] {
    if (siteId) {
      return this.history.filter(r => r.siteId === siteId);
    }
    return this.history;
  }
}
