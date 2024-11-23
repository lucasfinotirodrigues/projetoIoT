import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://api.thingspeak.com/channels/2759855/feeds.json?api_key=J3OIVN6KV3HUHT7Q&results=15';

  constructor(private http: HttpClient) {}

  getAPI(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
