import { signal, computed, Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { NotificationService } from '../notification/notification';

export interface FileMetrics {
  file_name: string;
  relative_path: string;
  bug_fix_count: number;
  metrics: {
    loc: number;
    lloc: number;
    comments: number;
    avg_complexity: number;
    max_complexity: number;
    token_count: number;
  };
  ai_advice?: string;
}

@Service()
export class AnalysisService {
  private apiUrl = 'http://localhost:5001/api/analyze';

  private _reportData = signal<FileMetrics[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly reportData = this._reportData.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly mostDangerousFile = computed(() => {
    const data = this._reportData();
    if (data.length === 0) return null;
    return data.reduce((prev, current) => (prev.bug_fix_count > current.bug_fix_count) ? prev : current);
  });

  readonly hasData = computed(() => this._reportData().length > 0);

  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  /**
   * This method sends a POST request to the backend API to trigger the analysis of the specified repository.
   * @param repoUrl GitHub repository URL to analyze
   */
  triggerAnalysis(repoUrl: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    this._reportData.set([]);

    this.http.post<FileMetrics[]>(this.apiUrl, { repoUrl }).pipe(
      tap((data) => {
        this._reportData.set(data);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._error.set('Failed to fetch analysis report. Please try again later.');
        this._isLoading.set(false);
        this.notificationService.show('Failed to fetch analysis report. Please try again later.', 'error');
        throw err;
      })
    ).subscribe();
  }
}