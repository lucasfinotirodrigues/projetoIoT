import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  channel: any;
  feeds: any[] = [];

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
      },
      (error) => {
        console.error('Erro ao consumir a API:', error);
      }
    );
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
}

// Constants for file types
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
