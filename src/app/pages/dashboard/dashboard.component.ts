import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe] // Adicione DatePipe ao providers
})
export class DashboardComponent implements OnInit {
  channel: any;
  feeds: any[] = [];
  data: any;
  options: any;
  viewMode: 'table' | 'chart' = 'table'; // Variável para controlar a visualização

  constructor(private apiService: ApiService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.getAPI();
  }

  getAPI() {
    this.apiService.getAPI().subscribe(
      (data) => {
        console.warn('Dados da API:', data);
        this.channel = data.channel;
        this.feeds = data.feeds;
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
      labels: this.feeds.map(feed => this.datePipe.transform(feed.created_at, 'dd/MM/yyyy HH:mm:ss')), // Formatação da data
      datasets: [
        {
          type: 'bar',
          label: 'Temperatura',
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          borderColor: 'white',
          borderWidth: 2,
          data: this.feeds.map(feed => feed.field1)
        },
        {
          type: 'bar',
          label: 'Umidade',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          data: this.feeds.map(feed => feed.field2),
          borderColor: 'white',
          borderWidth: 2
        }
        // Outros datasets...
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

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.feeds, {
      header: ['field1', 'field2', 'created_at']
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feeds');

    // Generate buffer
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Create a blob and download it
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    const fileName: string = 'horta.xlsx';
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(data);
    downloadLink.download = fileName;
    downloadLink.click();
  }

  // Método para alternar a visualização
  toggleView(view: 'table' | 'chart') {
    this.viewMode = view;
  }
}

// Constants for file types
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
