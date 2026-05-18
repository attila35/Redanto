import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthorService } from '../../../core/services/author.service';
import { AuthorDetail, GutendexBook } from '../../../core/models/models';
import { BookCardComponent } from '../../../shared/components/book-card/book-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-author-detail',
  imports: [RouterLink, BookCardComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <a routerLink="/authors" class="back-link">← Back to authors</a>

      @if (loading()) {
        <app-loading-spinner label="Loading author…" />
      } @else if (error()) {
        <p class="form-error">{{ error() }}</p>
      } @else if (author(); as a) {
        <header class="author-header card">
          <div class="portrait">
            @if (a.portraitUrl) {
              <img [src]="a.portraitUrl" [alt]="a.name" />
            } @else {
              <span class="portrait-initial">{{ initial(a.name) }}</span>
            }
          </div>
          <div class="info">
            <h1>{{ a.name }}</h1>
            <p class="years">{{ lifespan() }}</p>
            @if (a.biography) {
              <p class="bio">{{ a.biography }}</p>
            } @else {
              <p class="bio bio-empty">No biography on file for this author yet.</p>
            }
          </div>
        </header>

        <section class="books-section">
          <h2>Books</h2>

          @if (loadingBooks()) {
            <app-loading-spinner label="Loading books…" />
          } @else if (books().length === 0) {
            <p class="empty">No books linked to this author yet.</p>
          } @else {
            <div class="book-grid">
              @for (book of books(); track book.id) {
                <app-book-card [book]="book" />
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: var(--space-4);
      color: var(--color-text-muted);
    }

    .author-header {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: var(--space-6);
      align-items: start;
      margin-bottom: var(--space-8);
    }
    .portrait {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background-color: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .portrait img { width: 100%; height: 100%; object-fit: cover; }
    .portrait-initial {
      font-size: 4rem;
      font-family: var(--font-serif);
      color: var(--color-primary);
    }
    h1 { margin-bottom: var(--space-2); }
    .years {
      color: var(--color-text-muted);
      font-family: var(--font-serif);
      font-style: italic;
      margin-bottom: var(--space-4);
    }
    .bio { font-family: var(--font-serif); font-size: 1.05rem; line-height: 1.7; }
    .bio-empty { color: var(--color-text-muted); font-style: italic; }

    .books-section h2 { margin-bottom: var(--space-5); }
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-5);
    }
    .empty {
      text-align: center;
      padding: var(--space-6);
      color: var(--color-text-muted);
      font-style: italic;
    }

    @media (max-width: 600px) {
      .author-header {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .portrait { margin: 0 auto; }
    }
  `]
})
export class AuthorDetailComponent implements OnInit {
  private authorsSvc = inject(AuthorService);
  private router = inject(Router);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly loadingBooks = signal(false);
  readonly error = signal<string | null>(null);
  readonly author = signal<AuthorDetail | null>(null);
  readonly books = signal<GutendexBook[]>([]);

  readonly lifespan = computed(() => {
    const a = this.author();
    if (!a) return '';
    if (a.birthYear && a.deathYear) return `${a.birthYear} – ${a.deathYear}`;
    if (a.birthYear) return `Born ${a.birthYear}`;
    return '';
  });

  ngOnInit(): void {
    const numericId = Number(this.id());
    if (Number.isNaN(numericId)) {
      this.router.navigateByUrl('/authors');
      return;
    }

    this.authorsSvc.get(numericId).subscribe({
      next: a => {
        this.author.set(a);
        this.loading.set(false);
        this.loadBooks(numericId);
      },
      error: err => {
        this.error.set(err?.error?.error ?? 'Author not found.');
        this.loading.set(false);
      }
    });
  }

  private loadBooks(id: number): void {
    this.loadingBooks.set(true);
    this.authorsSvc.books(id).subscribe({
      next: list => { this.books.set(list); this.loadingBooks.set(false); },
      error: () => this.loadingBooks.set(false)
    });
  }

  initial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
