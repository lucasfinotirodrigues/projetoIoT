import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListaService {
  lista: any[] = [];
  estufaSelecionada: string = '';

  constructor() { }
}
