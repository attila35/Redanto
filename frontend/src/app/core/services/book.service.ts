import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GutendexBook, GutendexSearchResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/books`;

  search(query: string | null, page: number = 1): Observable<GutendexSearchResponse> {
    let params = new HttpParams().set('page', page.toString());
    if (query && query.trim()) {
      params = params.set('search', query.trim());
    }
    return this.http.get<GutendexSearchResponse>(this.base, { params });
  }

  get(gutendexId: number): Observable<GutendexBook> {
    return this.http.get<GutendexBook>(`${this.base}/${gutendexId}`);
  }

  getContent(gutendexId: number): Observable<string> {
    return this.http.get(`${this.base}/${gutendexId}/content`, { responseType: 'text' });
  }
}
