import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UploadedBook } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/uploads`;

  list(): Observable<UploadedBook[]> {
    return this.http.get<UploadedBook[]>(this.base);
  }

  get(id: number): Observable<UploadedBook> {
    return this.http.get<UploadedBook>(`${this.base}/${id}`);
  }

  create(
    title: string,
    author: string,
    description: string,
    bookFile: File,
    coverImage: File | null
  ): Observable<UploadedBook> {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('author', author);
    fd.append('description', description);
    fd.append('bookFile', bookFile);
    if (coverImage) fd.append('coverImage', coverImage);
    return this.http.post<UploadedBook>(this.base, fd);
  }

  update(id: number, patch: Partial<Pick<UploadedBook, 'title' | 'author' | 'description'>>): Observable<UploadedBook> {
    return this.http.put<UploadedBook>(`${this.base}/${id}`, patch);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  fileUrl(id: number): string {
    return `${this.base}/${id}/file`;
  }

  /** Fetch the file as a Blob so we can build a same-origin object URL
      that an <iframe> or <a download> can use without needing the JWT
      in the iframe's request headers. */
  fileBlob(id: number): Observable<Blob> {
    return this.http.get(this.fileUrl(id), { responseType: 'blob' });
  }
}
