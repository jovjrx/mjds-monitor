import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

export default class HistoryManager<T> {
  protected history: T[] = [];
  private readonly cacheKey: string;
  private readonly filePath: string;

  constructor(cacheKey: string, fileName: string) {
    this.cacheKey = cacheKey;
    this.filePath = join(process.cwd(), 'data', fileName);
    this.loadHistory();
  }

  protected loadHistory() {
    const cached = cache.get(this.cacheKey);
    if (cached !== undefined) {
      this.history = cached as T[];
      return;
    }
    try {
      if (existsSync(this.filePath)) {
        const data = readFileSync(this.filePath, 'utf-8');
        this.history = JSON.parse(data);
        cache.set(this.cacheKey, this.history);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      this.history = [];
      cache.set(this.cacheKey, []);
    }
  }

  protected saveHistory() {
    cache.set(this.cacheKey, this.history);
    try {
      writeFileSync(this.filePath, JSON.stringify(this.history, null, 2), 'utf-8');
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  protected addRecord(record: T) {
    this.history.push(record);
    this.saveHistory();
  }

  public getHistory(): T[] {
    return this.history;
  }
}
