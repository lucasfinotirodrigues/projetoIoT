import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { UIChart } from 'primeng/chart'; // Importe o tipo UIChart
import { Chart, Plugin } from 'chart.js'; // Importe o Chart.js e Plugin
import { AnalysisResult } from 'src/app/interface/IAnalysisResult.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart') chart!: UIChart; // Capture a referência do gráfico
  channel: any;
  feeds: any[] = [];
  data: any;
  options: any;
  viewMode: 'table' | 'chart' = 'table';
  mostrarToast = false;
  loadingAnalysis = false;
  analysisResults?: AnalysisResult;
  momentoMaiorQueda!: string;
  precisaoPredicao!: number;
  quedaUmidadeSegundo!: number;
  umidadeAtual!: number;

  constructor(
    private apiService: ApiService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.getAPI(); // Chama imediatamente ao inicializar
    setInterval(() => {
      this.getAPI();
    }, 10000); // 10000 milissegundos = 10 segundos
  }

  getDadosXlsx(): void {
    this.apiService.getTestIrrigationData().subscribe((dados: AnalysisResult) => {
      this.momentoMaiorQueda = dados.momento_maior_queda;
      this.precisaoPredicao = dados.precisao_da_predicao;
      this.quedaUmidadeSegundo = dados.queda_umidade_por_segundo;
      this.umidadeAtual = dados.umidade_atual;
      // Exibe o toast por 5 segundos
      this.mostrarToast = true;
      setTimeout(() => {
        this.mostrarToast = false;
      }, 5000);
    });
  }

  getAPI() {
    this.apiService.getAPI().subscribe(
      (data) => {
        // console.warn('Dados da API:', data);
        this.channel = data.channel;
        this.feeds = data.feeds.reverse();
        this.updateChartData();
      },
      (error) => {
        console.error('Erro ao consumir a API:', error);
      }
    );
  }

  updateChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
      labels: this.feeds.map(feed => this.datePipe.transform(feed.created_at, 'dd/MM/yyyy HH:mm:ss')),
      datasets: [
        {
          type: 'bar',
          label: 'Temperatura do ar',
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          borderColor: 'white',
          borderWidth: 2,
          data: this.feeds.map(feed => feed.field1)
        },
        {
          type: 'bar',
          label: 'Umidade do ar',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          data: this.feeds.map(feed => feed.field2),
          borderColor: 'white',
          borderWidth: 2
        },
        {
          type: 'bar',
          label: 'Umidade do solo',
          backgroundColor: documentStyle.getPropertyValue('--orange-500'),
          borderColor: 'white',
          data: this.feeds.map(feed => feed.field3),
          borderWidth: 2
        }
      ]
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        background: { // Configuração do plugin de fundo
          color: '#ffffff' // Cor branca para o fundo
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  toggleView(view: 'table' | 'chart') {
    this.viewMode = view;
  }

  downloadChartAsPng() {
    if (this.chart && this.chart.chart) {
      const chartInstance = this.chart.chart; // Obtenha a instância do gráfico
      const base64Image = chartInstance.toBase64Image(); // Converta para Base64
      const downloadLink = document.createElement('a');
      downloadLink.href = base64Image;
      downloadLink.download = 'chart.png'; // Nome do arquivo
      downloadLink.click();
    }
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.feeds, {
      header: ['field1', 'field2', 'field3','created_at']
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feeds');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    const fileName: string = 'smartAgroPET.xlsx';
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(data);
    downloadLink.download = fileName;
    downloadLink.click();
  }
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

// Plugin para adicionar fundo branco ao gráfico
const whiteBackgroundPlugin: Plugin = {
  id: 'whiteBackground',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

// Registro do plugin globalmente
Chart.register(whiteBackgroundPlugin);
