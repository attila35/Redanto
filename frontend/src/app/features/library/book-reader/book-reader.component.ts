import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

type Theme = 'light' | 'sepia' | 'dark';
type FontFamily = 'serif' | 'sans';
type Width = 'narrow' | 'wide';

interface ReaderSettings {
  fontSize: number;
  theme: Theme;
  fontFamily: FontFamily;
  width: Width;
  lineHeight: number;
}

const STORAGE_KEY = 'redanto:reader-settings';

const DEFAULTS: ReaderSettings = {
  fontSize: 18,
  theme: 'sepia',
  fontFamily: 'serif',
  width: 'narrow',
  lineHeight: 1.8,
};

const THEMES: Record<Theme, { bg: string; text: string; toolbar: string; border: string }> = {
  light: { bg: '#FFFFFF', text: '#1a1a1a', toolbar: '#f5f5f5', border: '#e0e0e0' },
  sepia: { bg: '#F5EDD6', text: '#3D2B1F', toolbar: '#EDE0C4', border: '#D9C9A8' },
  dark:  { bg: '#1C1C1E', text: '#E5E0D8', toolbar: '#2C2C2E', border: '#3A3A3C' },
};

@Component({
  selector: 'app-book-reader',
  imports: [RouterLink, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="reader-shell" [style]="shellStyles()">

      <!-- Toolbar -->
      <header class="toolbar" [style]="toolbarStyles()">
        <a [routerLink]="['/library', id()]" class="back-link" [style]="mutedStyle()">
          ← Back
        </a>

        <div class="title-area">
          @if (title()) {
            <span class="book-title" [style]="mutedStyle()">{{ title() }}</span>
          }
        </div>

        <div class="controls">
          <!-- Font size -->
          <div class="control-group" [style]="borderStyle()">
            <button class="ctrl-btn" (click)="adjustFontSize(-1)"
                    [disabled]="settings().fontSize <= 14"
                    title="Decrease font size" [style]="ctrlStyle()">A−</button>
            <span class="ctrl-label" [style]="mutedStyle()">{{ settings().fontSize }}</span>
            <button class="ctrl-btn" (click)="adjustFontSize(1)"
                    [disabled]="settings().fontSize >= 28"
                    title="Increase font size" [style]="ctrlStyle()">A+</button>
          </div>

          <!-- Line height -->
          <div class="control-group" [style]="borderStyle()">
            <button class="ctrl-btn" (click)="adjustLineHeight(-0.1)"
                    [disabled]="settings().lineHeight <= 1.4"
                    title="Tighter lines" [style]="ctrlStyle()">↕−</button>
            <button class="ctrl-btn" (click)="adjustLineHeight(0.1)"
                    [disabled]="settings().lineHeight >= 2.4"
                    title="Looser lines" [style]="ctrlStyle()">↕+</button>
          </div>

          <!-- Font family -->
          <div class="control-group" [style]="borderStyle()">
            <button class="ctrl-btn"
                    [class.ctrl-btn--active]="settings().fontFamily === 'serif'"
                    (click)="setFontFamily('serif')"
                    title="Serif font" [style]="fontBtnStyle('serif')">Serif</button>
            <button class="ctrl-btn"
                    [class.ctrl-btn--active]="settings().fontFamily === 'sans'"
                    (click)="setFontFamily('sans')"
                    title="Sans-serif font" [style]="fontBtnStyle('sans')">Sans</button>
          </div>

          <!-- Width -->
          <div class="control-group" [style]="borderStyle()">
            <button class="ctrl-btn"
                    [class.ctrl-btn--active]="settings().width === 'narrow'"
                    (click)="setWidth('narrow')"
                    title="Narrow column" [style]="widthBtnStyle('narrow')">▐</button>
            <button class="ctrl-btn"
                    [class.ctrl-btn--active]="settings().width === 'wide'"
                    (click)="setWidth('wide')"
                    title="Wide column" [style]="widthBtnStyle('wide')">▐▌</button>
          </div>

          <!-- Theme -->
          <div class="control-group theme-swatches">
            <button class="swatch swatch--light"
                    [class.swatch--active]="settings().theme === 'light'"
                    (click)="setTheme('light')" title="Light theme"></button>
            <button class="swatch swatch--sepia"
                    [class.swatch--active]="settings().theme === 'sepia'"
                    (click)="setTheme('sepia')" title="Sepia theme"></button>
            <button class="swatch swatch--dark"
                    [class.swatch--active]="settings().theme === 'dark'"
                    (click)="setTheme('dark')" title="Dark theme"></button>
          </div>
        </div>
      </header>

      <!-- Content area -->
      <main class="reader-scroll">
        @if (loading()) {
          <div class="spinner-wrap">
            <app-loading-spinner label="Opening book…" />
          </div>
        } @else if (error()) {
          <div class="reader-error">
            <p>{{ error() }}</p>
            <a [routerLink]="['/library', id()]" class="btn btn-ghost">← Back to book</a>
          </div>
        } @else if (content()) {
          <article class="reader-content" [style]="contentStyles()" [innerHTML]="content()">
          </article>
        }
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100dvh;
      overflow: hidden;
    }

    .reader-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: background 0.2s, color 0.2s;
    }

    /* ── Toolbar ── */
    .toolbar {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 1.25rem;
      border-bottom-width: 1px;
      border-bottom-style: solid;
      transition: background 0.2s, border-color 0.2s;
      flex-wrap: wrap;
    }

    .back-link {
      font-size: 0.9rem;
      text-decoration: none;
      white-space: nowrap;
      transition: opacity 0.15s;
    }
    .back-link:hover { opacity: 0.7; }

    .title-area {
      flex: 1;
      min-width: 0;
    }
    .book-title {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 0.88rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 0.15rem;
      border-right-width: 1px;
      border-right-style: solid;
      padding-right: 0.5rem;
      margin-right: 0.25rem;
    }
    .control-group:last-child {
      border-right: none;
      padding-right: 0;
      margin-right: 0;
    }

    .ctrl-btn {
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      border: none;
      background: transparent;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background 0.12s;
    }
    .ctrl-btn:disabled { opacity: 0.35; cursor: default; }
    .ctrl-label {
      font-size: 0.75rem;
      min-width: 1.5rem;
      text-align: center;
    }

    .theme-swatches { gap: 0.3rem; }

    .swatch {
      width: 1.1rem;
      height: 1.1rem;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.1s, border-color 0.1s;
    }
    .swatch:hover { transform: scale(1.15); }
    .swatch--active { border-color: #C9873A !important; transform: scale(1.1); }
    .swatch--light { background: #FFFFFF; box-shadow: 0 0 0 1px #ccc; }
    .swatch--sepia  { background: #F5EDD6; box-shadow: 0 0 0 1px #D9C9A8; }
    .swatch--dark  { background: #1C1C1E; box-shadow: 0 0 0 1px #555; }

    /* ── Scroll area ── */
    .reader-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 2.5rem 1rem 5rem;
    }

    .spinner-wrap, .reader-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      gap: 1rem;
    }

    /* ── Article ── */
    .reader-content {
      margin: 0 auto;
      transition: max-width 0.2s, font-size 0.15s, font-family 0.1s;
    }

    /* Normalise Gutenberg HTML inside the article */
    .reader-content ::ng-deep {
      img { max-width: 100%; height: auto; }
      a { color: inherit; opacity: 0.75; }
      a:hover { opacity: 1; }
      p { margin-bottom: 0.9em; }
      h1, h2, h3, h4, h5, h6 { margin: 1.4em 0 0.5em; line-height: 1.25; }
      blockquote { margin-left: 2em; font-style: italic; opacity: 0.8; }
      pre { white-space: pre-wrap; word-break: break-word; }
      table { width: 100%; border-collapse: collapse; }
      td, th { padding: 0.35em 0.5em; border-bottom: 1px solid rgba(0,0,0,0.1); }
      /* Hide Gutenberg chrome */
      #pg-header, #pg-footer,
      .pgheader, .pgfooter,
      #header, #footer { display: none !important; }
    }

    @media (max-width: 600px) {
      .toolbar { padding: 0.4rem 0.75rem; gap: 0.5rem; }
      .title-area { display: none; }
    }
  `]
})
export class BookReaderComponent implements OnInit {
  private bookService = inject(BookService);
  private sanitizer = inject(DomSanitizer);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly content = signal<SafeHtml | null>(null);
  readonly title = signal<string | null>(null);
  readonly settings = signal<ReaderSettings>(this.loadSettings());

  ngOnInit(): void {
    const numId = Number(this.id());

    this.bookService.get(numId).subscribe({
      next: b => this.title.set(b.title),
      error: () => {}
    });

    this.bookService.getContent(numId).subscribe({
      next: html => {
        this.content.set(this.sanitizer.bypassSecurityTrustHtml(html));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This book\'s content couldn\'t be loaded. It may not have an HTML version.');
        this.loading.set(false);
      }
    });
  }

  adjustFontSize(delta: number): void {
    this.update(s => ({ ...s, fontSize: Math.min(28, Math.max(14, s.fontSize + delta)) }));
  }

  adjustLineHeight(delta: number): void {
    this.update(s => ({ ...s, lineHeight: Math.round((Math.min(2.4, Math.max(1.4, s.lineHeight + delta))) * 10) / 10 }));
  }

  setFontFamily(f: FontFamily): void { this.update(s => ({ ...s, fontFamily: f })); }
  setWidth(w: Width): void { this.update(s => ({ ...s, width: w })); }
  setTheme(t: Theme): void { this.update(s => ({ ...s, theme: t })); }

  readonly shellStyles = computed(() => {
    const { theme, fontSize, lineHeight } = this.settings();
    const t = THEMES[theme];
    return `background:${t.bg}; color:${t.text}; font-size:${fontSize}px; line-height:${lineHeight};`;
  });

  readonly toolbarStyles = computed(() => {
    const t = THEMES[this.settings().theme];
    return `background:${t.toolbar}; border-color:${t.border};`;
  });

  readonly contentStyles = computed(() => {
    const { fontFamily, width } = this.settings();
    const maxW = width === 'narrow' ? '660px' : '900px';
    const ff = fontFamily === 'serif'
      ? "var(--font-serif, Georgia, serif)"
      : "var(--font-sans, -apple-system, sans-serif)";
    return `max-width:${maxW}; font-family:${ff};`;
  });

  readonly mutedStyle = computed(() => {
    const t = THEMES[this.settings().theme];
    return `color:${t.text}; opacity:0.6;`;
  });

  readonly borderStyle = computed(() => `border-color:${THEMES[this.settings().theme].border};`);

  ctrlStyle(): string {
    const t = THEMES[this.settings().theme];
    return `color:${t.text};`;
  }

  fontBtnStyle(f: FontFamily): string {
    const active = this.settings().fontFamily === f;
    const t = THEMES[this.settings().theme];
    return active
      ? `color:${t.text}; background:${t.border}; font-weight:600;`
      : `color:${t.text}; opacity:0.6;`;
  }

  widthBtnStyle(w: Width): string {
    const active = this.settings().width === w;
    const t = THEMES[this.settings().theme];
    return active
      ? `color:${t.text}; background:${t.border}; font-weight:600;`
      : `color:${t.text}; opacity:0.6;`;
  }

  private update(fn: (s: ReaderSettings) => ReaderSettings): void {
    const next = fn(this.settings());
    this.settings.set(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  private loadSettings(): ReaderSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {}
    return { ...DEFAULTS };
  }
}
