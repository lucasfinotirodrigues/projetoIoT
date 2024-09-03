import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://api.thingspeak.com/channels/2141966/feeds.json?api_key=EX1VAR2WW3758ER4&results=2';

  constructor(private http: HttpClient) {}

  getAPI(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
