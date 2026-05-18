import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GutendexBook } from '../../../core/models/models';

@Component({
  selector: 'app-book-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [routerLink]="['/library', book().id]" class="card-link">
      <article class="book-card">
        <div class="cover">
          @if (coverUrl()) {
            <img [src]="coverUrl()" [alt]="book().title" loading="lazy" />
          } @else {
            <div class="cover-fallback">
              <span class="cover-title">{{ book().title }}</span>
            </div>
          }
        </div>
        <div class="meta">
          <h3 class="title">{{ book().title }}</h3>
          <p class="authors">{{ authorNames() }}</p>
        </div>
      </article>
    </a>
  `,
  styles: [`
    .card-link { text-decoration: none; color: inherit; display: block; }
    .card-link:hover { text-decoration: none; }
    .book-card {
      background-color: var(--color-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .book-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow);
    }
    .cover {
      aspect-ratio: 2 / 3;
      background-color: var(--color-surface);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cover-fallback {
      padding: var(--space-4);
      text-align: center;
      color: var(--color-primary);
      font-family: var(--font-serif);
    }
    .cover-title {
      font-size: 1rem;
      font-style: italic;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .meta { padding: var(--space-3); flex: 1; }
    .title {
      font-size: 1rem;
      margin-bottom: var(--space-1);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .authors {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class BookCardComponent {
  readonly book = input.required<GutendexBook>();

  readonly coverUrl = computed(() => this.book().formats?.['image/jpeg'] ?? null);
  readonly authorNames = computed(() =>
    this.book().authors?.map(a => a.name).join(', ') || 'Unknown author'
  );
}
