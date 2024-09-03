import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: [
    './listing.component.scss',
  ],
})
export class ListingComponent implements OnInit {
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
}
