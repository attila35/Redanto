import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { UploadService } from '../../../core/services/upload.service';
import { UploadedBook } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-upload-detail',
  imports: [RouterLink, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <a routerLink="/uploads" class="back-link">← Back to uploads</a>

      @if (loading()) {
        <app-loading-spinner label="Loading book…" />
      } @else if (error()) {
        <p class="form-error">{{ error() }}</p>
      } @else if (book(); as b) {
        <header class="book-header">
          <div>
            <h1>{{ b.title }}</h1>
            @if (b.author) { <p class="authors">by {{ b.author }}</p> }
            <p class="meta-line">
              <span class="format-tag" [class.pdf]="b.fileType === 'pdf'" [class.epub]="b.fileType === 'epub'">
                {{ b.fileType.toUpperCase() }}
              </span>
              · {{ b.fileName }}
              · Uploaded {{ formatDate(b.uploadedAt) }}
            </p>
          </div>
          <div class="actions">
            @if (blobUrl()) {
              <a [href]="blobUrl()" [download]="b.fileName" class="btn btn-ghost">Download</a>
            }
            <button class="btn btn-danger"
                    (click)="confirmDelete()"
                    [disabled]="deleting()">
              Delete
            </button>
          </div>
        </header>

        @if (b.description) {
          <section class="description card">
            <h3>About this book</h3>
            <p>{{ b.description }}</p>
          </section>
        }

        <section class="viewer card">
          @if (loadingFile()) {
            <app-loading-spinner label="Preparing viewer…" />
          } @else if (b.fileType === 'pdf' && safeUrl(); as url) {
            <iframe [src]="url" title="PDF viewer" class="pdf-frame"></iframe>
          } @else {
            <div class="viewer-fallback">
              <p>In-browser preview isn't available for EPUB files.</p>
              @if (blobUrl()) {
                <a [href]="blobUrl()" [download]="b.fileName" class="btn btn-primary">Download to read</a>
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
    .book-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-5);
      flex-wrap: wrap;
    }
    h1 { margin-bottom: var(--space-2); }
    .authors {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 1.1rem;
      color: var(--color-text-muted);
      margin-bottom: var(--space-2);
    }
    .meta-line { color: var(--color-text-muted); font-size: 0.9rem; }
    .format-tag {
      padding: 2px var(--space-2);
      border-radius: var(--radius-sm);
      color: var(--color-white);
      font-weight: 600;
      font-size: 0.75rem;
    }
    .format-tag.pdf { background-color: #B23A3A; }
    .format-tag.epub { background-color: #4A7A3A; }
    .actions { display: flex; gap: var(--space-2); }

    .description { margin-bottom: var(--space-5); }
    .description h3 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      margin-bottom: var(--space-2);
      font-family: var(--font-sans);
      font-weight: 600;
    }

    .viewer { padding: 0; overflow: hidden; min-height: 200px; }
    .pdf-frame {
      width: 100%;
      height: 80vh;
      border: none;
      display: block;
    }
    .viewer-fallback {
      padding: var(--space-8);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      align-items: center;
      color: var(--color-text-muted);
    }
  `]
})
export class UploadDetailComponent implements OnInit, OnDestroy {
  private uploads = inject(UploadService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly loadingFile = signal(false);
  readonly error = signal<string | null>(null);
  readonly book = signal<UploadedBook | null>(null);
  readonly blobUrl = signal<string | null>(null);
  readonly safeUrl = signal<SafeResourceUrl | null>(null);
  readonly deleting = signal(false);

  ngOnInit(): void {
    const numericId = Number(this.id());
    if (Number.isNaN(numericId)) {
      this.router.navigateByUrl('/uploads');
      return;
    }

    this.uploads.get(numericId).subscribe({
      next: b => {
        this.book.set(b);
        this.loading.set(false);
        this.loadFileBlob(b.id);
      },
      error: err => {
        this.error.set(err?.error?.error ?? 'Book not found.');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    const url = this.blobUrl();
    if (url) URL.revokeObjectURL(url);
  }

  private loadFileBlob(id: number): void {
    this.loadingFile.set(true);
    this.uploads.fileBlob(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        this.blobUrl.set(url);
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.loadingFile.set(false);
      },
      error: () => this.loadingFile.set(false)
    });
  }

  confirmDelete(): void {
    const b = this.book();
    if (!b) return;
    if (!confirm(`Delete "${b.title}"? This cannot be undone.`)) return;

    this.deleting.set(true);
    this.uploads.delete(b.id).subscribe({
      next: () => this.router.navigate(['/uploads']),
      error: () => this.deleting.set(false)
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
