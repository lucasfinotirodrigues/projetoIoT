// listing.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {
  lista: any[] = [];
  private apiUrl = 'https://api.thingspeak.com/channels/2141966/feeds.json?api_key=EX1VAR2WW3758ER4&results=2';

  constructor(private http: HttpClient, private router: Router) {} // Injeta o Router

  ngOnInit(): void {
    // Faz a requisição para a API
    this.http.get<any>(this.apiUrl).subscribe(data => {
      // Manipula o JSON conforme sua necessidade
      this.lista = data.feeds.map((feed: { field1: any; created_at: string | number | Date; field2: any; }) => ({
        estufa: data.channel.name,
        temp: feed.field1 || 'N/A',
        horario: new Date(feed.created_at).toLocaleTimeString(),
        umidade: feed.field2 || 'N/A',
        localizacao: `${data.channel.latitude}, ${data.channel.longitude}`
      }));
    });
  }


  selecionarEstufa(estufa: string): void {
    // Navega para o componente de dashboard passando o nome da estufa como parâmetro
    this.router.navigate(['/dashboard'], { queryParams: { estufa } });
  }
}
