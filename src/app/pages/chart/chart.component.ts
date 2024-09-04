import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-chart',
  template: `<div id="chart" style="width: 100%; height: 400px;"></div>`,
})
export class ChartComponent implements OnInit {
  channel: any;
  feeds: any;
  teste = 1;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getAPI();
    this.initChart() 
    console.warn("feeds => ", this.feeds);
    console.warn("channel => ", this.channel);
  }

  getAPI() {
    this.apiService.getAPI().subscribe(
      (data) => {
        console.warn('Dados da API:', data);
        this.channel = data.channel;
        this.feeds = data.feeds.field1;
      },
      (error) => {
        console.error('Erro ao consumir a API:', error);
      }
    );
  }

  initChart() {
    const chartDom = document.getElementById('chart');
    const myChart = echarts.init(chartDom); // Certifique-se de que o elemento não é nulo

    // Configuração do gráfico com os dados extraídos
    const option = {
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
          data: this.teste,
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
          data: this.teste,
          tooltip: {
            valueFormatter: function (value: number) {
              return value + ' °C';
            },
          },
        },
        {
          name: 'Umidade',
          type: 'line',
          yAxisIndex: 1,
          data: this.teste,
          tooltip: {
            valueFormatter: function (value: number) {
              return value + ' %';
            },
          },
        },
      ],
    };

    // Aplicar as configurações no gráfico
    myChart.setOption(option);
  }
}
