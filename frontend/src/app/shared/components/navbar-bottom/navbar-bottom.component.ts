import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar-bottom',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bottom-nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <span class="icon">🏠</span>
        <span class="label">Library</span>
      </a>
      @if (auth.isLoggedIn) {
        <a routerLink="/saved" routerLinkActive="active">
          <span class="icon">🔖</span>
          <span class="label">Saved</span>
        </a>
        <a routerLink="/uploads" routerLinkActive="active">
          <span class="icon">📤</span>
          <span class="label">Uploads</span>
        </a>
      }
      <a routerLink="/authors" routerLinkActive="active">
        <span class="icon">👤</span>
        <span class="label">Authors</span>
      </a>
      <button class="back-to-top" (click)="backToTop()" aria-label="Back to top">
        <span class="icon">↑</span>
        <span class="label">Top</span>
      </button>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: var(--navbar-bottom-height);
      display: flex;
      justify-content: space-around;
      align-items: center;
      background-color: var(--color-white);
      border-top: 1px solid var(--color-border);
      box-shadow: 0 -1px 3px rgba(61, 43, 31, 0.08);
      z-index: 90;
    }
    .bottom-nav a, .bottom-nav button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: var(--space-1) var(--space-3);
      color: var(--color-text-muted);
      font-size: 0.7rem;
      text-decoration: none;
      background: none;
      cursor: pointer;
      transition: color 0.15s ease;
    }
    .bottom-nav a:hover, .bottom-nav button:hover {
      color: var(--color-primary);
      text-decoration: none;
    }
    .bottom-nav a.active {
      color: var(--color-primary);
      font-weight: 500;
    }
    .icon { font-size: 1.2rem; }
    .label { font-family: var(--font-sans); }
  `]
})
export class NavbarBottomComponent {
  protected auth = inject(AuthService);

  backToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
