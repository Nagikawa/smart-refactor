import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisService } from '../../../services/analysis';
import * as echarts from 'echarts';

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
  public analysisService = inject(AnalysisService);

  @ViewChild('chartDom') chartDom!: ElementRef;
  private myChart: echarts.ECharts | null = null;

  constructor() {
    effect(() => {
      const data = this.analysisService.reportData();
      if (data.length > 0 && this.chartDom) {
        // 延時微調，確保 DOM 已經完全渲染完畢
        setTimeout(() => this.initChart(data), 50);
      }
    });
  }

  ngOnInit(): void {
    this.analysisService.triggerAnalysis('https://github.com/pallets/click.git');
  }

  private initChart(data: any[]): void {
    const dom = this.chartDom.nativeElement;
    if (!this.myChart) {
      this.myChart = echarts.init(dom);
    }

    // 數據加工：提取檔案名稱、Bug 修復次數、最大圈複雜度
    const fileNames = data.map(item => item.file_name).reverse();
    const bugFixes = data.map(item => item.bug_fix_count).reverse();
    const complexities = data.map(item => item.metrics.max_complexity).reverse();

    // 學術級多維雙軸條形圖配置
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Bug 修复次数', '最大圈复杂度'],
        textStyle: { color: '#333' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: fileNames,
        axisLabel: { interval: 0, fontSize: 11 }
      },
      series: [
        {
          name: 'Bug 修复次数',
          type: 'bar',
          data: bugFixes,
          itemStyle: { color: '#ff4d4f' } // 红色代表缺陷
        },
        {
          name: '最大圈复杂度',
          type: 'bar',
          data: complexities,
          itemStyle: { color: '#1890ff' } // 蓝色代表代码复杂度
        }
      ]
    };

    this.myChart.setOption(option);

    // 自適應螢幕大小變更
    window.addEventListener('resize', () => this.myChart?.resize());
  }
}