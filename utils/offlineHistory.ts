import { SiteOfflineHistory } from './verificarSite';
import HistoryManager from './historyManager';

const HISTORY_CACHE_KEY = 'offline_history';
const HISTORY_FILE = 'offline_history.json';

export class OfflineHistoryManager extends HistoryManager<SiteOfflineHistory> {
  constructor() {
    super(HISTORY_CACHE_KEY, HISTORY_FILE);
  }

  public siteWentOffline(siteId: string, siteName: string, url: string, statusCode?: number, error?: string): void {
    const now = new Date().toISOString();
    
    // Verificar se já existe um registro aberto para este site
    const existingRecord = this.history.find(record => 
      record.siteId === siteId && !record.wentOnlineAt
    );

    if (!existingRecord) {
      const newRecord: SiteOfflineHistory = {
        id: `${siteId}_${Date.now()}`,
        siteId,
        siteName,
        url,
        wentOfflineAt: now,
        statusCode,
        error,
      };
      
      this.history.push(newRecord);
      this.saveHistory();
    }
  }

  public siteWentOnline(siteId: string): void {
    const now = new Date().toISOString();
    
    // Encontrar o registro aberto para este site
    const record = this.history.find(record => 
      record.siteId === siteId && !record.wentOnlineAt
    );

    if (record) {
      record.wentOnlineAt = now;
      
      // Calcular duração em segundos
      const offlineTime = new Date(record.wentOfflineAt).getTime();
      const onlineTime = new Date(now).getTime();
      record.duration = Math.floor((onlineTime - offlineTime) / 1000);
      
      this.saveHistory();
    }
  }

  public getOfflineHistory(siteId?: string): SiteOfflineHistory[] {
    if (siteId) {
      return this.history.filter(record => record.siteId === siteId);
    }
    return this.history;
  }

  public getCurrentOfflineSites(): SiteOfflineHistory[] {
    return this.history.filter(record => !record.wentOnlineAt);
  }

  public getOfflineHistoryByDateRange(startDate: string, endDate: string): SiteOfflineHistory[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return this.history.filter(record => {
      const recordTime = new Date(record.wentOfflineAt).getTime();
      return recordTime >= start && recordTime <= end;
    });
  }

  public getTotalOfflineTime(siteId: string, days: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const relevantRecords = this.history.filter(record => 
      record.siteId === siteId && 
      new Date(record.wentOfflineAt) >= cutoffDate &&
      record.duration
    );
    
    return relevantRecords.reduce((total, record) => total + (record.duration || 0), 0);
  }

  public getOfflineStats(): {
    totalIncidents: number;
    currentOffline: number;
    totalOfflineTime: number;
    averageDowntime: number;
  } {
    const completedRecords = this.history.filter(record => record.duration);
    const currentOffline = this.getCurrentOfflineSites().length;
    
    const totalOfflineTime = completedRecords.reduce((total, record) => 
      total + (record.duration || 0), 0
    );
    
    const averageDowntime = completedRecords.length > 0 
      ? totalOfflineTime / completedRecords.length 
      : 0;

    return {
      totalIncidents: this.history.length,
      currentOffline,
      totalOfflineTime,
      averageDowntime,
    };
  }
} 