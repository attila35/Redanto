import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="card auth-card">
        <h1>Welcome back</h1>
        <p class="subtitle">Sign in to continue your reading.</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label" for="identifier">Username or email</label>
            <input id="identifier" class="form-input" type="text"
                   formControlName="identifier" autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input id="password" class="form-input" type="password"
                   formControlName="password" autocomplete="current-password" />
          </div>

          @if (error()) { <p class="form-error">{{ error() }}</p> }

          <button type="submit" class="btn btn-primary auth-submit"
                  [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="auth-foot">
          New here? <a routerLink="/register">Create an account</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) var(--space-4);
      min-height: calc(100vh - var(--navbar-top-height) - var(--navbar-bottom-height));
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
    }
    h1 { margin-bottom: var(--space-2); }
    .subtitle { color: var(--color-text-muted); margin-bottom: var(--space-5); }
    .auth-submit { width: 100%; margin-top: var(--space-3); }
    .auth-foot {
      margin-top: var(--space-5);
      text-align: center;
      color: var(--color-text-muted);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) return;
    const { identifier, password } = this.form.getRawValue();

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(identifier, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Sign-in failed. Please try again.');
      }
    });
  }
}
