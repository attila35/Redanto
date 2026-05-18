import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="card auth-card">
        <h1>Create your account</h1>
        <p class="subtitle">Start building your personal library.</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input id="username" class="form-input" type="text"
                   formControlName="username" autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input id="email" class="form-input" type="email"
                   formControlName="email" autocomplete="email" />
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input id="password" class="form-input" type="password"
                   formControlName="password" autocomplete="new-password" />
            <small class="hint">At least 6 characters.</small>
          </div>

          @if (error()) { <p class="form-error">{{ error() }}</p> }

          <button type="submit" class="btn btn-primary auth-submit"
                  [disabled]="form.invalid || loading()">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="auth-foot">
          Already have an account? <a routerLink="/login">Sign in</a>
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
    .auth-card { width: 100%; max-width: 420px; }
    h1 { margin-bottom: var(--space-2); }
    .subtitle { color: var(--color-text-muted); margin-bottom: var(--space-5); }
    .hint { color: var(--color-text-muted); font-size: 0.8rem; }
    .auth-submit { width: 100%; margin-top: var(--space-3); }
    .auth-foot {
      margin-top: var(--space-5);
      text-align: center;
      color: var(--color-text-muted);
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.form.invalid) return;
    const { username, email, password } = this.form.getRawValue();

    this.loading.set(true);
    this.error.set(null);

    this.auth.register(username, email, password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Registration failed. Please try again.');
      }
    });
  }
}
