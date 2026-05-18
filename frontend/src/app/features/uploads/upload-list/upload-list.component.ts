import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UploadService } from '../../../core/services/upload.service';
import { UploadedBook } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-upload-list',
  imports: [RouterLink, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <header class="page-header">
        <div>
          <h1>My Uploads</h1>
          <p class="subtitle">Books you've added to your personal library.</p>
        </div>
        <a routerLink="/uploads/new" class="btn btn-primary">+ Upload a book</a>
      </header>

      @if (loading()) {
        <app-loading-spinner label="Loading your uploads…" />
      } @else if (error()) {
        <p class="form-error">{{ error() }}</p>
      } @else if (books().length === 0) {
        <div class="empty card">
          <p>You haven't uploaded any books yet.</p>
          <a routerLink="/uploads/new" class="btn btn-primary">Upload your first book →</a>
        </div>
      } @else {
        <ul class="upload-grid">
          @for (book of books(); track book.id) {
            <li class="upload-item card">
              <a [routerLink]="['/uploads', book.id]" class="upload-link">
                <div class="format-badge" [class.pdf]="book.fileType === 'pdf'" [class.epub]="book.fileType === 'epub'">
                  {{ book.fileType.toUpperCase() }}
                </div>
                <div class="meta">
                  <h3>{{ book.title }}</h3>
                  @if (book.author) { <p class="authors">by {{ book.author }}</p> }
                  <p class="file-info">
                    {{ book.fileName }} · {{ formatSize(book.fileSizeBytes) }}
                  </p>
                </div>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: var(--space-6);
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .subtitle { color: var(--color-text-muted); }

    .empty {
      text-align: center;
      padding: var(--space-8);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      color: var(--color-text-muted);
    }

    .upload-grid { list-style: none; display: grid; gap: var(--space-4); }
    .upload-item { padding: var(--space-4); }
    .upload-link {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: var(--space-4);
      align-items: center;
      color: inherit;
      text-decoration: none;
    }
    .upload-link:hover { text-decoration: none; }
    .upload-link:hover h3 { color: var(--color-primary); }

    .format-badge {
      width: 80px;
      height: 100px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--color-white);
      letter-spacing: 0.05em;
      font-size: 0.9rem;
    }
    .format-badge.pdf { background-color: #B23A3A; }
    .format-badge.epub { background-color: #4A7A3A; }

    .meta h3 { font-size: 1.1rem; margin-bottom: var(--space-1); transition: color 0.15s ease; }
    .authors { color: var(--color-text-muted); font-style: italic; margin-bottom: var(--space-1); }
    .file-info { color: var(--color-text-muted); font-size: 0.85rem; }
  `]
})
export class UploadListComponent implements OnInit {
  private uploads = inject(UploadService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly books = signal<UploadedBook[]>([]);

  ngOnInit(): void {
    this.uploads.list().subscribe({
      next: list => { this.books.set(list); this.loading.set(false); },
      error: err => {
        this.error.set(err?.error?.error ?? 'Failed to load uploads.');
        this.loading.set(false);
      }
    });
  }

  formatSize(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
