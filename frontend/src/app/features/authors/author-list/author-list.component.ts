import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthorService } from '../../../core/services/author.service';
import { Author } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-author-list',
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <header class="page-header">
        <h1>Authors</h1>
        <p class="subtitle">Discover the people behind the words.</p>
      </header>

      <form class="search-row" (ngSubmit)="search()">
        <input
          class="form-input"
          type="search"
          placeholder="Search by name…"
          [(ngModel)]="query"
          name="q"
          aria-label="Search authors" />
        <button type="submit" class="btn btn-primary">Search</button>
      </form>

      @if (loading()) {
        <app-loading-spinner label="Loading authors…" />
      } @else if (error()) {
        <p class="form-error">{{ error() }}</p>
      } @else if (authors().length === 0) {
        <p class="empty">No authors found yet. The author catalog grows as users visit author pages.</p>
      } @else {
        <ul class="author-grid">
          @for (author of authors(); track author.id) {
            <li class="author-card card">
              <a [routerLink]="['/authors', author.id]" class="author-link">
                <div class="portrait">
                  @if (author.portraitUrl) {
                    <img [src]="author.portraitUrl" [alt]="author.name" />
                  } @else {
                    <span class="portrait-initial">{{ initial(author.name) }}</span>
                  }
                </div>
                <div class="meta">
                  <h3>{{ author.name }}</h3>
                  <p class="years">{{ lifespan(author) }}</p>
                </div>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: var(--space-5); }
    .subtitle { color: var(--color-text-muted); }

    .search-row {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
      max-width: 480px;
    }
    .search-row .form-input { flex: 1; }

    .empty {
      text-align: center;
      padding: var(--space-8);
      color: var(--color-text-muted);
      font-style: italic;
    }

    .author-grid {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4);
    }
    .author-card { padding: var(--space-4); }
    .author-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      color: inherit;
      text-decoration: none;
      text-align: center;
    }
    .author-link:hover { text-decoration: none; }
    .author-link:hover h3 { color: var(--color-primary); }

    .portrait {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .portrait img { width: 100%; height: 100%; object-fit: cover; }
    .portrait-initial {
      font-size: 2.5rem;
      font-family: var(--font-serif);
      color: var(--color-primary);
    }
    h3 { font-size: 1.05rem; transition: color 0.15s ease; }
    .years { color: var(--color-text-muted); font-size: 0.85rem; }
  `]
})
export class AuthorListComponent implements OnInit {
  private authorsSvc = inject(AuthorService);

  query = '';
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly authors = signal<Author[]>([]);

  ngOnInit(): void { this.fetch(); }

  search(): void { this.fetch(); }

  private fetch(): void {
    this.loading.set(true);
    this.authorsSvc.search(this.query.trim() || null).subscribe({
      next: list => { this.authors.set(list); this.loading.set(false); },
      error: err => {
        this.error.set(err?.error?.error ?? 'Failed to load authors.');
        this.loading.set(false);
      }
    });
  }

  initial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  lifespan(a: Author): string {
    if (a.birthYear && a.deathYear) return `${a.birthYear} – ${a.deathYear}`;
    if (a.birthYear) return `Born ${a.birthYear}`;
    return '—';
  }
}
