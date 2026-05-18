import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/library/book-list/book-list.component').then(m => m.BookListComponent),
    title: 'Redanto — Find your next read'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Sign in — Redanto'
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Create an account — Redanto'
  },
  {
    path: 'library/:id',
    loadComponent: () =>
      import('./features/library/book-detail/book-detail.component').then(m => m.BookDetailComponent),
    title: 'Book — Redanto'
  },
  {
    path: 'saved',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/saved-books/saved-list/saved-list.component').then(m => m.SavedListComponent),
    title: 'Read Later — Redanto'
  },
  {
    path: 'uploads',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/uploads/upload-list/upload-list.component').then(m => m.UploadListComponent),
    title: 'My Uploads — Redanto'
  },
  {
    path: 'uploads/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/uploads/upload-form/upload-form.component').then(m => m.UploadFormComponent),
    title: 'Upload a book — Redanto'
  },
  {
    path: 'uploads/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/uploads/upload-detail/upload-detail.component').then(m => m.UploadDetailComponent),
    title: 'Upload — Redanto'
  },
  {
    path: 'authors',
    loadComponent: () =>
      import('./features/authors/author-list/author-list.component').then(m => m.AuthorListComponent),
    title: 'Authors — Redanto'
  },
  {
    path: 'authors/:id',
    loadComponent: () =>
      import('./features/authors/author-detail/author-detail.component').then(m => m.AuthorDetailComponent),
    title: 'Author — Redanto'
  },
  { path: '**', redirectTo: '' }
];
