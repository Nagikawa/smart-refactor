import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisService } from '../../services/analysis/analysis.service';
import { RepoSearch } from '../repo-search/repo-search';
import { NotificationToast } from '../notification-toast/notification-toast';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RepoSearch, NotificationToast],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  public analysisService = inject(AnalysisService);

  onStartAnalysis(repoUrl: string): void {
    this.analysisService.triggerAnalysis(repoUrl);
  }
}