# Redanto Frontend (Angular 20)

The browser-side of the Redanto book-reading app. Built with Angular 20
standalone components, signals, the new `@if`/`@for` control flow, and
the reactive HTTP client.

## Stack

| Concern         | Tech                                                 |
|-----------------|------------------------------------------------------|
| Framework       | Angular 20 (standalone, signals, OnPush)             |
| State           | Signals + RxJS for HTTP                              |
| Forms           | Reactive forms (`@angular/forms`)                    |
| Routing         | `provideRouter` with lazy-loaded components          |
| HTTP            | `provideHttpClient` + functional interceptors        |
| Styling         | SCSS + CSS variables (warm bibliophile theme)        |
| Fonts           | Crimson Pro (serif) + Inter (sans), via Google Fonts |
| Build tool      | `@angular/build` (esbuild application builder)       |

## Project layout

```
src/
├── index.html
├── main.ts
├── styles.scss                 # Global tokens + utility classes
├── environments/
│   ├── environment.ts          # Dev → API on localhost:5000
│   └── environment.prod.ts
└── app/
    ├── app.component.ts        # Shell: top navbar / outlet / bottom navbar
    ├── app.config.ts           # Providers (router, http, interceptors)
    ├── app.routes.ts           # Lazy route map
    ├── core/
    │   ├── models/             # API shapes (User, GutendexBook, ...)
    │   ├── services/           # AuthService, BookService, SavedBooksService, UploadService, AuthorService
    │   ├── guards/             # authGuard (functional)
    │   └── interceptors/       # jwtInterceptor, errorInterceptor
    ├── shared/components/
    │   ├── navbar-top/         # Logo + rotating literary quotes + account menu
    │   ├── navbar-bottom/      # Fixed icon nav (Library / Saved / Uploads / Authors / Top)
    │   ├── book-card/          # Reusable Gutendex book tile
    │   └── loading-spinner/
    └── features/
        ├── auth/{login,register}/
        ├── library/{book-list,book-detail}/
        ├── saved-books/saved-list/
        ├── uploads/{upload-list,upload-form,upload-detail}/
        └── authors/{author-list,author-detail}/
```

## Prerequisites

- Node 20.19+ (or 22.x). Check: `node -v`
- Backend running on `http://localhost:5000` (see `../backend/README.md`)

## First-time setup

```powershell
cd frontend
npm install
npm start
```

The dev server boots on `http://localhost:4200` and proxies nothing — it
calls the backend directly at the URL in `src/environments/environment.ts`.
The backend's CORS policy already allows `http://localhost:4200`.

If your backend runs on a different port, edit:
```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## Design tokens

All colors / spacing / fonts live as CSS variables in `src/styles.scss`.
Swap a single value there to retheme the whole app. The default palette:

| Token              | Value     | Used for                |
|--------------------|-----------|-------------------------|
| `--color-bg`       | `#FAF3E0` | Page background         |
| `--color-surface`  | `#F0E6CE` | Cards, chips, panels    |
| `--color-primary`  | `#7A4F2D` | Buttons, links          |
| `--color-accent`   | `#C9873A` | CTAs, highlights        |
| `--color-text`     | `#3D2B1F` | Body text               |

## Route map

| Path                | Component                | Guard       |
|---------------------|--------------------------|-------------|
| `/`                 | `BookListComponent`      | —           |
| `/login`            | `LoginComponent`         | —           |
| `/register`         | `RegisterComponent`      | —           |
| `/library/:id`      | `BookDetailComponent`    | —           |
| `/saved`            | `SavedListComponent`     | `authGuard` |
| `/uploads`          | `UploadListComponent`    | `authGuard` |
| `/uploads/new`      | `UploadFormComponent`    | `authGuard` |
| `/uploads/:id`      | `UploadDetailComponent`  | `authGuard` |
| `/authors`          | `AuthorListComponent`    | —           |
| `/authors/:id`      | `AuthorDetailComponent`  | —           |

Components receive route params via the `input()` API thanks to
`withComponentInputBinding()` in `app.config.ts`. No manual
`ActivatedRoute` parsing required.

## Auth flow

1. `LoginComponent` / `RegisterComponent` call `AuthService` → backend
2. JWT + user are persisted to `localStorage` and exposed as a signal
3. `jwtInterceptor` adds `Authorization: Bearer <token>` to every request
4. `errorInterceptor` logs out + redirects on `401`
5. `authGuard` blocks protected routes when no token is present

## PDF viewer

The upload-detail page fetches the file as a Blob via `HttpClient` (so
the JWT interceptor applies), then creates an object URL for the
`<iframe>`. This avoids sending the token in a query string or trying
to hack headers into an iframe request. EPUB has no in-browser preview
and offers a download instead.

## Notable choices

- **Inline templates everywhere.** Each component is one `.ts` file with
  template + styles inline. Easier to navigate for an academic project
  than splitting into 3 files per component.
- **No state management library.** Signals + per-feature service calls
  are sufficient at this scale. Avoid NgRx until the data flow demands it.
- **OnPush change detection.** Every component uses `OnPush` because the
  signal-based state model gives us cheap, automatic dirty-checking.
- **Lazy routes.** Every feature page is `loadComponent`-loaded so the
  initial bundle only contains the shell + landing page.

## Build for production

```powershell
npm run build
```

Output lands in `dist/redanto-frontend/`. Serve it behind the .NET API
(or any static host) and update `environment.prod.ts` so `apiUrl`
points to the right backend URL.
