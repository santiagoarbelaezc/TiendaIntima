import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full min-h-[280px] flex items-center justify-center">
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class ChartWrapperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) type!: ChartType;
  @Input({ required: true }) labels!: string[];
  @Input({ required: true }) data!: number[];
  @Input() labelName = 'Ventas';
  @Input() colors?: string[];

  private chartInstance?: Chart;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chartInstance && (changes['data'] || changes['labels'] || changes['type'])) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  private renderChart(): void {
    if (!this.canvasRef?.nativeElement) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const defaultColors = this.colors || [
      '#111111',
      '#EAC7D2',
      '#D59AAD',
      '#64748B',
      '#0EA5E9',
      '#10B981',
      '#F59E0B'
    ];

    const isLine = this.type === 'line';

    const config: ChartConfiguration = {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.labelName,
            data: this.data,
            backgroundColor: isLine ? 'rgba(234, 199, 210, 0.2)' : defaultColors,
            borderColor: isLine ? '#111111' : '#FFFFFF',
            borderWidth: isLine ? 3 : 2,
            fill: isLine,
            tension: 0.3,
            pointBackgroundColor: '#111111',
            pointRadius: isLine ? 4 : 0,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.type !== 'line' && this.type !== 'bar',
            position: 'bottom',
            labels: {
              font: { family: 'inherit', size: 12, weight: 'bold' },
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#111111',
            titleFont: { family: 'inherit', size: 13, weight: 'bold' },
            bodyFont: { family: 'inherit', size: 13 },
            padding: 12,
            cornerRadius: 12,
            displayColors: true
          }
        },
        scales: (this.type === 'line' || this.type === 'bar') ? {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { family: 'inherit', size: 11 }, color: 'rgba(0,0,0,0.5)' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'inherit', size: 11 }, color: 'rgba(0,0,0,0.5)' }
          }
        } : undefined
      }
    };

    this.chartInstance = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chartInstance) return;
    this.chartInstance.data.labels = this.labels;
    this.chartInstance.data.datasets[0].data = this.data;
    if (this.colors) {
      this.chartInstance.data.datasets[0].backgroundColor = this.colors;
    }
    this.chartInstance.update();
  }
}
