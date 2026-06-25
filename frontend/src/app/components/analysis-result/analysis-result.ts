import { Component, inject, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as echarts from 'echarts';
import { AnalysisService } from '../../services/analysis/analysis.service';

@Component({
  selector: 'app-analysis-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-layout">
      <div class="alert-card animate-slide">
        🚨 <strong>Core Technology Debt Warning：</strong> 
        System detected high-risk files. Strongly recommend prioritizing refactoring!
      </div>

      <div class="chart-container">
        <h3>📊 Top 20 Code Files Risk Distribution (Bug Frequency vs Maximum Cyclomatic Complexity)</h3>
        <div #chartDom class="echarts-dom"></div>
      </div>
    </div>
  `,
  styles: [`
    .results-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .alert-card {
      background: rgba(255, 77, 79, 0.1);
      border: 1px solid rgba(255, 77, 79, 0.3);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: #ff4d4f;
    }
    .chart-container {
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      h3 { margin-top: 0; margin-bottom: 1.5rem; color: #333; }
      .echarts-dom { width: 100%; height: 500px; }
    }
  `]
})
export class AnalysisResultComponent {
  public analysisService = inject(AnalysisService);
  
  @ViewChild('chartDom') chartDom!: ElementRef;
  private myChart: echarts.ECharts | null = null;

  constructor() {
    effect(() => {
      const data = this.analysisService.reportData();
      if (data.length > 0 && this.chartDom) {
        setTimeout(() => this.initChart(data), 50);
      }
    });
  }

  private initChart(data: any[]): void {
    const dom = this.chartDom.nativeElement;
    if (!this.myChart) {
      this.myChart = echarts.init(dom);
    }

    const fileNames = data.map(item => item.file_name).reverse();
    const bugFixes = data.map(item => item.bug_fix_count).reverse();
    const complexities = data.map(item => item.metrics.max_complexity).reverse();

    const option: echarts.EChartsOption = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Bug Fixes', 'Maximum Cyclomatic Complexity'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: fileNames },
      series: [
        { name: 'Bug Fixes', type: 'bar', data: bugFixes, itemStyle: { color: '#ff4d4f' } },
        { name: 'Maximum Cyclomatic Complexity', type: 'bar', data: complexities, itemStyle: { color: '#1890ff' } }
      ]
    };

    this.myChart.setOption(option);
    window.addEventListener('resize', () => this.myChart?.resize());
  }
}