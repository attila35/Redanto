import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { GutendexSearchResponse } from '../../../core/models/models';
import { BookCardComponent } from '../../../shared/components/book-card/book-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-book-list',
  imports: [FormsModule, BookCardComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="hero-inner">
        <h1 class="hero-title">Find your next great read.</h1>
        <p class="hero-sub">Thousands of public-domain books, ready to discover.</p>

        <form class="search-form" (ngSubmit)="search()">
          <input
            class="search-input"
            type="search"
            placeholder="Search by title, author, or subject…"
            [(ngModel)]="query"
            name="q"
            aria-label="Search books" />
          <button type="submit" class="btn btn-accent search-btn">Search</button>
        </form>

        <button class="discover-btn" (click)="scrollToGrid()">
          or discover directly ↓
        </button>
      </div>
    </section>

    <section #grid id="book-grid" class="container">
      @if (loading()) {
        <app-loading-spinner label="Fetching books…" />
      } @else if (error()) {
        <p class="form-error">{{ error() }}</p>
      } @else if (results(); as r) {
        <div class="grid-header">
          <h2>{{ headerLabel() }}</h2>
          <p class="count">{{ r.count.toLocaleString() }} books</p>
        </div>

        <div class="book-grid">
          @for (book of r.results; track book.id) {
            <app-book-card [book]="book" />
          } @empty {
            <p class="empty">No books matched your search.</p>
          }
        </div>

        <div class="pagination">
          <button class="btn btn-ghost"
                  (click)="changePage(page() - 1)"
                  [disabled]="!r.previous">
            ← Previous
          </button>
          <span class="page-info">Page {{ page() }}</span>
          <button class="btn btn-ghost"
                  (click)="changePage(page() + 1)"
                  [disabled]="!r.next">
            Next →
          </button>
        </div>
      }
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%);
      padding: var(--space-10) var(--space-4);
      text-align: center;
    }
    .hero-inner { max-width: 720px; margin: 0 auto; }
    .hero-title {
      font-size: 3rem;
      margin-bottom: var(--space-3);
    }
    .hero-sub {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 1.2rem;
      color: var(--color-text-muted);
      margin-bottom: var(--space-6);
    }
    .search-form {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }
    .search-input {
      flex: 1;
      padding: var(--space-4) var(--space-5);
      border: 2px solid var(--color-border);
      border-radius: var(--radius);
      background-color: var(--color-white);
      color: var(--color-text);
      font-size: 1.05rem;
      transition: border-color 0.15s ease;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    .search-btn { padding: 0 var(--space-6); font-size: 1rem; }
    .discover-btn {
      color: var(--color-primary);
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 1rem;
      padding: var(--space-2) var(--space-3);
      transition: color 0.15s ease;
    }
    .discover-btn:hover { color: var(--color-accent); }

    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: var(--space-5);
    }
    .count { color: var(--color-text-muted); }
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-5);
    }
    .empty {
      text-align: center;
      padding: var(--space-8);
      color: var(--color-text-muted);
      font-style: italic;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--space-4);
      margin: var(--space-8) 0;
    }
    .page-info {
      color: var(--color-text-muted);
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .hero-title { font-size: 2rem; }
      .search-form { flex-direction: column; }
      .search-btn { padding: var(--space-3); }
    }
  `]
})
export class BookListComponent {
  private books = inject(BookService);

  @ViewChild('grid') gridEl?: ElementRef<HTMLElement>;

  query = '';
  readonly page = signal(1);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly results = signal<GutendexSearchResponse | null>(null);
  readonly activeQuery = signal<string | null>(null);

  readonly headerLabel = () =>
    this.activeQuery() ? `Results for “${this.activeQuery()}”` : 'Popular books';

  constructor() {
    this.fetch();
  }

  search(): void {
    this.activeQuery.set(this.query.trim() || null);
    this.page.set(1);
    this.fetch();
    this.scrollToGrid();
  }

  changePage(p: number): void {
    if (p < 1) return;
    this.page.set(p);
    this.fetch();
    this.scrollToGrid();
  }

  scrollToGrid(): void {
    queueMicrotask(() => {
      this.gridEl?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private fetch(): void {
    this.loading.set(true);
    this.error.set(null);
    this.books.search(this.activeQuery(), this.page()).subscribe({
      next: r => {
        this.results.set(r);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.error?.error ?? 'Failed to load books.');
        this.loading.set(false);
      }
    });
  }
}
