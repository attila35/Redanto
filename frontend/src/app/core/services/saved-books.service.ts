import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GutendexBook, SavedBook } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SavedBooksService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/saved-books`;

  list(): Observable<SavedBook[]> {
    return this.http.get<SavedBook[]>(this.base);
  }

  save(book: GutendexBook): Observable<SavedBook> {
    return this.http.post<SavedBook>(this.base, {
      gutendexBookId: book.id,
      title: book.title,
      authors: JSON.stringify(book.authors.map(a => a.name)),
      coverImageUrl: book.formats['image/jpeg'] ?? null
    });
  }

  remove(gutendexBookId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${gutendexBookId}`);
  }
}
