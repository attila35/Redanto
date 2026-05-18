import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UploadService } from '../../../core/services/upload.service';

const ALLOWED_EXTS = ['.pdf', '.epub'];
const MAX_BYTES = 50 * 1024 * 1024;

@Component({
  selector: 'app-upload-form',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container narrow">
      <a routerLink="/uploads" class="back-link">← Back to uploads</a>

      <div class="card">
        <h1>Upload a book</h1>
        <p class="subtitle">Add a PDF or EPUB to your personal library.</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label" for="title">Title</label>
            <input id="title" class="form-input" type="text" formControlName="title" />
          </div>

          <div class="form-group">
            <label class="form-label" for="author">Author <span class="optional">(optional)</span></label>
            <input id="author" class="form-input" type="text" formControlName="author" />
          </div>

          <div class="form-group">
            <label class="form-label" for="description">Description <span class="optional">(optional)</span></label>
            <textarea id="description" class="form-textarea" rows="4" formControlName="description"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="bookFile">Book file</label>
            <input id="bookFile" type="file" accept=".pdf,.epub" (change)="onBookFile($event)" />
            @if (bookFile()) {
              <small class="file-info">Selected: {{ bookFile()!.name }} ({{ formatSize(bookFile()!.size) }})</small>
            } @else {
              <small class="hint">PDF or EPUB, max 50 MB.</small>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="coverImage">Cover image <span class="optional">(optional)</span></label>
            <input id="coverImage" type="file" accept="image/*" (change)="onCoverFile($event)" />
            @if (coverFile()) {
              <small class="file-info">Selected: {{ coverFile()!.name }}</small>
            }
          </div>

          @if (error()) { <p class="form-error">{{ error() }}</p> }

          <div class="actions">
            <a routerLink="/uploads" class="btn btn-ghost">Cancel</a>
            <button type="submit" class="btn btn-primary"
                    [disabled]="form.invalid || !bookFile() || loading()">
              {{ loading() ? 'Uploading…' : 'Upload book' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .narrow { max-width: 640px; }
    .back-link {
      display: inline-block;
      margin-bottom: var(--space-4);
      color: var(--color-text-muted);
    }
    h1 { margin-bottom: var(--space-2); }
    .subtitle { color: var(--color-text-muted); margin-bottom: var(--space-6); }
    .optional { color: var(--color-text-muted); font-weight: 400; }
    .hint, .file-info { color: var(--color-text-muted); font-size: 0.85rem; }
    .file-info { color: var(--color-success); }
    input[type=file] {
      padding: var(--space-2);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius);
      background-color: var(--color-bg);
      width: 100%;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-5);
    }
  `]
})
export class UploadFormComponent {
  private fb = inject(FormBuilder);
  private uploads = inject(UploadService);
  private router = inject(Router);

  readonly bookFile = signal<File | null>(null);
  readonly coverFile = signal<File | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(500)]],
    author: [''],
    description: ['']
  });

  onBookFile(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) { this.bookFile.set(null); return; }

    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      this.error.set('Only .pdf and .epub files are accepted.');
      this.bookFile.set(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      this.error.set('File exceeds the 50 MB limit.');
      this.bookFile.set(null);
      return;
    }
    this.error.set(null);
    this.bookFile.set(file);
  }

  onCoverFile(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.coverFile.set(file);
  }

  submit(): void {
    const file = this.bookFile();
    if (this.form.invalid || !file) return;
    const { title, author, description } = this.form.getRawValue();

    this.loading.set(true);
    this.error.set(null);
    this.uploads.create(title, author, description, file, this.coverFile()).subscribe({
      next: created => this.router.navigate(['/uploads', created.id]),
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Upload failed. Please try again.');
      }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
