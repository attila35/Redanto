import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarTopComponent } from './shared/components/navbar-top/navbar-top.component';
import { NavbarBottomComponent } from './shared/components/navbar-bottom/navbar-bottom.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarTopComponent, NavbarBottomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar-top />
    <main class="app-main">
      <router-outlet />
    </main>
    <app-navbar-bottom />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .app-main {
      flex: 1;
      padding-top: var(--navbar-top-height);
      padding-bottom: var(--navbar-bottom-height);
    }
  `]
})
export class AppComponent {}
