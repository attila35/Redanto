import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface LiteraryQuote {
  text: string;
  author: string;
}

const QUOTES: LiteraryQuote[] = [
  { text: 'A reader lives a thousand lives before he dies.', author: 'George R.R. Martin' },
  { text: 'There is no friend as loyal as a book.', author: 'Ernest Hemingway' },
  { text: 'So many books, so little time.', author: 'Frank Zappa' },
  { text: 'Books are a uniquely portable magic.', author: 'Stephen King' },
  { text: 'I cannot live without books.', author: 'Thomas Jefferson' },
  { text: 'A room without books is like a body without a soul.', author: 'Cicero' },
  { text: 'Read the best books first.', author: 'Henry David Thoreau' },
  { text: 'A book is a dream that you hold in your hands.', author: 'Neil Gaiman' },
  { text: 'Until I feared I would lose it, I never loved to read.', author: 'Harper Lee' },
  { text: 'We read to know we are not alone.', author: 'C.S. Lewis' },
  { text: 'You can never get a cup of tea large enough or a book long enough to suit me.', author: 'C.S. Lewis' },
  { text: 'A great book should leave you with many experiences.', author: 'William Styron' }
];

@Component({
  selector: 'app-navbar-top',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="navbar">
      <a routerLink="/" class="logo" aria-label="Home">
        <span class="logo-mark">❧</span>
        <span class="logo-text">Redanto</span>
      </a>

      <div class="quote" aria-live="polite">
        <span class="quote-text">&ldquo;{{ current().text }}&rdquo;</span>
        <span class="quote-author">— {{ current().author }}</span>
      </div>

      <div class="account">
        @if (user(); as u) {
          <button class="account-button" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()">
            <span class="avatar">{{ initial() }}</span>
            <span class="username">{{ u.username }}</span>
            <span class="caret">▾</span>
          </button>
          @if (menuOpen()) {
            <div class="menu" (click)="closeMenu()">
              <a routerLink="/saved" routerLinkActive="active">My Saved</a>
              <a routerLink="/uploads" routerLinkActive="active">My Uploads</a>
              <a routerLink="/authors" routerLinkActive="active">Authors</a>
              <hr />
              <button (click)="logout()">Sign out</button>
            </div>
          }
        } @else {
          <a routerLink="/login" class="btn btn-ghost">Sign in</a>
          <a routerLink="/register" class="btn btn-primary">Register</a>
        }
      </div>
    </header>
  `,
  styleUrl: './navbar-top.component.scss'
})
export class NavbarTopComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly initial = computed(() => this.user()?.username.charAt(0).toUpperCase() ?? '?');

  private index = signal(Math.floor(Math.random() * QUOTES.length));
  readonly current = computed(() => QUOTES[this.index()]!);
  readonly menuOpen = signal(false);

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.index.update(i => (i + 1) % QUOTES.length);
    }, 8000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }
}
