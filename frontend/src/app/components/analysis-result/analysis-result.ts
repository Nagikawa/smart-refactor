import { Component, inject, ElementRef, ViewChild, effect, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as echarts from 'echarts';
import { AnalysisService } from '../../services/analysis/analysis.service';

@Component({
  selector: 'app-analysis-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analysis-result.html',
  styleUrls: [`./analysis-result.scss`]
})
export class AnalysisResultComponent implements AfterViewInit, OnDestroy {
  public analysisService = inject(AnalysisService);
  
  @ViewChild('chartDom') chartDom!: ElementRef;
  private myChart: echarts.ECharts | null = null;
  private resizeListener = () => this.myChart?.resize();

  constructor() {
    effect(() => {
      const data = this.analysisService.reportData();
      if (data.length > 0 && this.myChart) {
        this.updateChartOptions(data);
      }
    });
  }

  ngAfterViewInit(): void {
    const data = this.analysisService.reportData();
    if (data.length > 0 && this.chartDom) {
      this.initChart(data);
    }
  }

  private initChart(data: any[]): void {
    const dom = this.chartDom.nativeElement;
    this.myChart = echarts.init(dom);
    
    this.updateChartOptions(data);
    window.addEventListener('resize', this.resizeListener);
  }

  private updateChartOptions(data: any[]): void {
    if (!this.myChart) return;

    const fileNames = data.map(item => item.file_name).reverse();
    const bugFixes = data.map(item => item.bug_fix_count).reverse();
    const complexities = data.map(item => item.metrics.max_complexity).reverse();

    const option: echarts.EChartsOption = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Bug Fix count', 'Max Cyclomatic Complexity'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: fileNames, axisLabel: { fontSize: 11 } },
      series: [
        { name: 'Bug Fix count', type: 'bar', data: bugFixes, itemStyle: { color: '#ff4d4f' } },
        { name: 'Max Cyclomatic Complexity', type: 'bar', data: complexities, itemStyle: { color: '#1890ff' } }
      ]
    };

    this.myChart.setOption(option);
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    this.myChart?.dispose();
  }
}