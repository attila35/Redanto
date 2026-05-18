import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavedBooksService } from '../../../core/services/saved-books.service';
import { SavedBook } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-saved-list',
  imports: [RouterLink, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <header class="page-header">
        <h1>My Reading List</h1>
        <p class="subtitle">Books you've saved to come back to.</p>
      </header>

      @if (loading()) {
        <app-loading-spinner label="Loading your list…" />
      } @else if (error()) {
        <p class="form-error">{{ error() }}</p>
      } @else if (books().length === 0) {
        <div class="empty card">
          <p>Your reading list is empty.</p>
          <a routerLink="/" class="btn btn-primary">Browse the library →</a>
        </div>
      } @else {
        <ul class="saved-grid">
          @for (book of books(); track book.id) {
            <li class="saved-item card">
              <a [routerLink]="['/library', book.gutendexBookId]" class="saved-link">
                @if (book.coverImageUrl) {
                  <img [src]="book.coverImageUrl" [alt]="book.title ?? ''" class="cover" />
                } @else {
                  <div class="cover cover-fallback">📖</div>
                }
                <div class="meta">
                  <h3>{{ book.title ?? 'Untitled' }}</h3>
                  <p class="authors">{{ parseAuthors(book.authors) }}</p>
                  <p class="saved-at">Saved {{ formatDate(book.savedAt) }}</p>
                </div>
              </a>
              <button class="btn btn-danger remove-btn"
                      (click)="remove(book)"
                      [disabled]="removing() === book.id">
                Remove
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: var(--space-6); }
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

    .saved-grid {
      list-style: none;
      display: grid;
      gap: var(--space-4);
    }
    .saved-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-4);
      align-items: center;
      padding: var(--space-4);
    }
    .saved-link {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: var(--space-4);
      align-items: center;
      color: inherit;
      text-decoration: none;
    }
    .saved-link:hover { text-decoration: none; }
    .saved-link:hover h3 { color: var(--color-primary); }

    .cover {
      width: 64px;
      height: 96px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      background-color: var(--color-surface);
    }
    .cover-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .meta h3 { font-size: 1.1rem; margin-bottom: var(--space-1); transition: color 0.15s ease; }
    .authors { color: var(--color-text-muted); font-size: 0.9rem; }
    .saved-at { color: var(--color-text-muted); font-size: 0.8rem; margin-top: var(--space-1); }
  `]
})
export class SavedListComponent implements OnInit {
  private savedSvc = inject(SavedBooksService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly books = signal<SavedBook[]>([]);
  readonly removing = signal<number | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.savedSvc.list().subscribe({
      next: list => { this.books.set(list); this.loading.set(false); },
      error: err => {
        this.error.set(err?.error?.error ?? 'Failed to load saved books.');
        this.loading.set(false);
      }
    });
  }

  remove(book: SavedBook): void {
    this.removing.set(book.id);
    this.savedSvc.remove(book.gutendexBookId).subscribe({
      next: () => {
        this.books.update(list => list.filter(b => b.id !== book.id));
        this.removing.set(null);
      },
      error: () => this.removing.set(null)
    });
  }

  parseAuthors(authorsJson: string | null): string {
    if (!authorsJson) return 'Unknown author';
    try {
      const arr = JSON.parse(authorsJson) as string[];
      return Array.isArray(arr) ? arr.join(', ') : authorsJson;
    } catch {
      return authorsJson;
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
