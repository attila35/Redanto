import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Author, AuthorDetail, GutendexBook } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthorService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/authors`;

  search(query: string | null): Observable<Author[]> {
    let params = new HttpParams();
    if (query && query.trim()) params = params.set('q', query.trim());
    return this.http.get<Author[]>(this.base, { params });
  }

  get(id: number): Observable<AuthorDetail> {
    return this.http.get<AuthorDetail>(`${this.base}/${id}`);
  }

  books(id: number): Observable<GutendexBook[]> {
    return this.http.get<GutendexBook[]>(`${this.base}/${id}/books`);
  }
}
