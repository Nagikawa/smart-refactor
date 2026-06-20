import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisService } from '../../../services/analysis';

interface FileMetrics {
  file_name: string;
  bug_fix_count: number;
  metrics: { loc: number; max_complexity: number; };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  analysisData = signal<FileMetrics[]>([]);
  isLoading = signal<boolean>(false);

  public analysisService = inject(AnalysisService);

  constructor() {}

  ngOnInit(): void {
    this.analysisService.triggerAnalysis('https://github.com/pallets/click.git');
  }
}