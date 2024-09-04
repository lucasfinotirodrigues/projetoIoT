import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  channel: any;
  feeds: any[] = [];
  chartOption: EChartsOption = {}; 
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getAPI();
  }

  getAPI() {
    this.apiService.getAPI().subscribe(
      (data) => {
        console.warn('Dados da API:', data);
        this.channel = data.channel;
        this.feeds = data.feeds;
        this.initChart(); // Inicializar o gráfico após receber os dados
      },
      (error) => {
        console.error('Erro ao consumir a API:', error);
      }
    );
  }

  initChart() {
    // Configuração do gráfico com os dados extraídos
    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      legend: {
        data: ['Temperatura', 'Umidade'],
      },
      xAxis: [
        {
          type: 'category',
          data: this.feeds.map(feed => feed.created_at), // Ajustar para pegar os dados corretos
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Temperatura',
          axisLabel: {
            formatter: '{value} °C',
          },
        },
        {
          type: 'value',
          name: 'Umidade',
          axisLabel: {
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: 'Temperatura',
          type: 'bar',
          data: this.feeds.map(feed => feed.field1),
          tooltip: {
            valueFormatter: (value: echarts.OptionDataValue | echarts.OptionDataValue[]) => {
              if (typeof value === 'number') {
                return `${value} °C`;
              }
              return '';
            },
          },
        },
        {
          name: 'Umidade',
          type: 'line',
          yAxisIndex: 1,
          data: this.feeds.map(feed => feed.field2),
          tooltip: {
            valueFormatter: (value: echarts.OptionDataValue | echarts.OptionDataValue[]) => {
              if (typeof value === 'number') {
                
                return `${value} %`;
              }
              return '';
            },
          },
        },
      ],
      
    };
  }
}
