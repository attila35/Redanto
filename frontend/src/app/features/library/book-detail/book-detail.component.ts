import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { SavedBooksService } from '../../../core/services/saved-books.service';
import { AuthService } from '../../../core/services/auth.service';
import { GutendexBook } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-book-detail',
  imports: [RouterLink, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      @if (loading()) {
        <app-loading-spinner label="Loading book…" />
      } @else if (error()) {
        <p class="form-error">{{ error() }}</p>
      } @else if (book(); as b) {
        <a routerLink="/" class="back-link">← Back to library</a>

        <div class="layout">
          <div class="cover-col">
            @if (coverUrl()) {
              <img class="cover" [src]="coverUrl()" [alt]="b.title" />
            } @else {
              <div class="cover cover-fallback">
                <span>{{ b.title }}</span>
              </div>
            }

            <div class="actions">
              @if (auth.isLoggedIn) {
                <button class="btn btn-primary save-btn"
                        (click)="toggleSave()"
                        [disabled]="saving()">
                  @if (saved()) {
                    ✓ Saved
                  } @else {
                    🔖 Save for later
                  }
                </button>
              } @else {
                <a routerLink="/login" class="btn btn-ghost">Sign in to save</a>
              }

              @if (readUrl()) {
                <a [routerLink]="['/library', b.id, 'read']" class="btn btn-accent">
                  Read here
                </a>
                <a [href]="readUrl()" target="_blank" rel="noopener" class="btn btn-ghost read-external">
                  Read online ↗
                </a>
              }
            </div>
          </div>

          <div class="meta-col">
            <h1>{{ b.title }}</h1>
            <p class="authors">
              by
              @for (author of b.authors; track author.name; let last = $last) {
                <span>{{ author.name }}@if (!last) {, }</span>
              }
            </p>

            @if (b.subjects?.length) {
              <section class="meta-section">
                <h3>Subjects</h3>
                <div class="chips">
                  @for (subject of b.subjects.slice(0, 8); track subject) {
                    <span class="chip">{{ subject }}</span>
                  }
                </div>
              </section>
            }

            @if (b.languages?.length) {
              <section class="meta-section">
                <h3>Languages</h3>
                <p>{{ b.languages.join(', ').toUpperCase() }}</p>
              </section>
            }

            <section class="meta-section">
              <h3>Downloads</h3>
              <p>{{ b.downloadCount.toLocaleString() }}</p>
            </section>

            <section class="meta-section">
              <h3>Available formats</h3>
              <ul class="formats">
                @for (entry of formatEntries(); track entry[0]) {
                  <li>
                    <a [href]="entry[1]" target="_blank" rel="noopener">
                      {{ formatLabel(entry[0]) }} ↗
                    </a>
                  </li>
                }
              </ul>
            </section>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: var(--space-4);
      color: var(--color-text-muted);
    }
    .layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: var(--space-8);
      align-items: start;
    }
    .cover-col { position: sticky; top: calc(var(--navbar-top-height) + var(--space-4)); }
    .cover {
      width: 100%;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      display: block;
    }
    .cover-fallback {
      aspect-ratio: 2 / 3;
      background-color: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-5);
      font-family: var(--font-serif);
      font-style: italic;
      color: var(--color-primary);
      text-align: center;
    }
    .actions {
      margin-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .save-btn, .actions a.btn { width: 100%; }
    .read-external { font-size: 0.88rem; opacity: 0.75; }
    .read-external:hover { opacity: 1; }

    .meta-col h1 {
      font-size: 2.5rem;
      margin-bottom: var(--space-3);
    }
    .authors {
      font-family: var(--font-serif);
      font-size: 1.2rem;
      font-style: italic;
      color: var(--color-text-muted);
      margin-bottom: var(--space-6);
    }
    .meta-section {
      margin-bottom: var(--space-5);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }
    .meta-section h3 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      margin-bottom: var(--space-2);
      font-family: var(--font-sans);
      font-weight: 600;
    }
    .chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .chip {
      padding: var(--space-1) var(--space-3);
      background-color: var(--color-surface);
      border-radius: 999px;
      font-size: 0.85rem;
      color: var(--color-text);
    }
    .formats { list-style: none; }
    .formats li { padding: var(--space-1) 0; }

    @media (max-width: 768px) {
      .layout { grid-template-columns: 1fr; }
      .cover-col { position: static; max-width: 280px; margin: 0 auto; }
    }
  `]
})
export class BookDetailComponent implements OnInit {
  private books = inject(BookService);
  private savedBooks = inject(SavedBooksService);
  protected auth = inject(AuthService);
  private router = inject(Router);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly book = signal<GutendexBook | null>(null);
  readonly saved$ = signal(false);
  readonly saving = signal(false);

  readonly saved = this.saved$.asReadonly();
  readonly coverUrl = computed(() => this.book()?.formats?.['image/jpeg'] ?? null);
  readonly readUrl = computed(() => {
    const f = this.book()?.formats;
    if (!f) return null;
    return f['text/html'] ?? f['text/html; charset=utf-8'] ?? null;
  });
  readonly formatEntries = computed(() => {
    const f = this.book()?.formats;
    if (!f) return [];
    return Object.entries(f).filter(([k]) => !k.startsWith('image/'));
  });

  ngOnInit(): void {
    const numericId = Number(this.id());
    if (Number.isNaN(numericId)) {
      this.router.navigateByUrl('/');
      return;
    }

    this.books.get(numericId).subscribe({
      next: b => {
        this.book.set(b);
        this.loading.set(false);
        this.refreshSavedState();
      },
      error: err => {
        this.error.set(err?.error?.error ?? 'Book not found.');
        this.loading.set(false);
      }
    });
  }

  toggleSave(): void {
    const b = this.book();
    if (!b || this.saving()) return;

    this.saving.set(true);
    if (this.saved$()) {
      this.savedBooks.remove(b.id).subscribe({
        next: () => { this.saved$.set(false); this.saving.set(false); },
        error: () => this.saving.set(false)
      });
    } else {
      this.savedBooks.save(b).subscribe({
        next: () => { this.saved$.set(true); this.saving.set(false); },
        error: () => this.saving.set(false)
      });
    }
  }

  formatLabel(mime: string): string {
    if (mime.includes('epub')) return 'EPUB';
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('html')) return 'HTML (read online)';
    if (mime.includes('plain')) return 'Plain text';
    if (mime.includes('rdf')) return 'RDF metadata';
    return mime;
  }

  private refreshSavedState(): void {
    if (!this.auth.isLoggedIn) return;
    const b = this.book();
    if (!b) return;
    this.savedBooks.list().subscribe(list => {
      this.saved$.set(list.some(s => s.gutendexBookId === b.id));
    });
  }
}
