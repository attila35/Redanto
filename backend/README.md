# Redanto Backend (.NET 8 Web API)

REST API for the Redanto book-reading app. Built with ASP.NET Core 8,
EF Core (PostgreSQL), Redis (distributed cache), and JWT bearer auth.

## Stack

| Layer            | Tech                                              |
|------------------|---------------------------------------------------|
| Framework        | ASP.NET Core 8 Web API (controller-based)         |
| ORM              | EF Core 8 + Npgsql                                |
| Database         | PostgreSQL                                        |
| Cache            | Redis (via `IDistributedCache`)                   |
| Auth             | JWT bearer + BCrypt password hashing              |
| External API     | Gutendex (`https://gutendex.com/`)                |
| File storage     | Local filesystem under `uploads/` (per-user dir)  |

## Project layout

```
Redanto.API/
├── Controllers/      # HTTP boundary
├── Services/         # Business logic (interfaces + implementations)
├── Repositories/     # Data access (EF Core)
├── Data/             # AppDbContext + EF configuration
├── Models/           # Entities
├── DTOs/             # Request/response shapes
├── Options/          # Strongly-typed appsettings sections
├── Middleware/       # ErrorHandlingMiddleware (global JSON errors)
├── Exceptions/       # AppException hierarchy
├── Extensions/       # ClaimsPrincipal.GetUserId() helper
├── Program.cs        # Composition root (DI, pipeline)
└── appsettings.json
```

The pattern is **Controller → Service → Repository → DbContext**.
Controllers stay thin (HTTP concerns only); services own the rules.

## Prerequisites

- .NET SDK 8.0+
- PostgreSQL 14+ running locally on `localhost:5432`
- Redis running locally on `localhost:6379`
- (Optional) `dotnet-ef` tool: `dotnet tool install --global dotnet-ef`

## First-time setup

1. **Create the database**
   ```bash
   createdb redanto
   ```
2. **Configure secrets** — open `appsettings.json` and replace
   `Jwt.SecretKey` with a long random string. For real deployments use
   `dotnet user-secrets` or environment variables instead of committing.

3. **Create the schema** — two options:

   **Option A (recommended, EF migrations):**
   ```bash
   cd Redanto.API
   dotnet ef migrations add Init
   dotnet ef database update
   ```
   On startup `Program.cs` calls `Database.Migrate()`, so future migrations
   apply automatically.

   **Option B (raw SQL, no EF tool needed):**
   ```bash
   psql -d redanto -f ../db/schema.sql
   ```
   If you take this path, remove the `db.Database.Migrate()` block at the
   bottom of `Program.cs` to avoid a startup history mismatch.

4. **Restore + run**
   ```bash
   cd Redanto.API
   dotnet restore
   dotnet run
   ```
   API boots on `http://localhost:5000` (or whatever `launchSettings.json`
   says). Swagger UI is at `/swagger`.

## Configuration reference (`appsettings.json`)

| Section                          | Purpose                                         |
|----------------------------------|-------------------------------------------------|
| `ConnectionStrings:Postgres`     | Npgsql connection string                        |
| `ConnectionStrings:Redis`        | Redis connection string                         |
| `Jwt:SecretKey`                  | HMAC signing key (≥ 32 chars)                   |
| `Jwt:ExpiryHours`                | Token lifetime                                  |
| `Gutendex:BaseUrl`               | External API base                               |
| `Gutendex:SearchCacheTtlSeconds` | Default 259 200 (3 days)                        |
| `Gutendex:BookCacheTtlSeconds`   | Default 604 800 (7 days)                        |
| `Uploads:RootPath`               | Where Multer-equivalent saves files             |
| `Uploads:MaxFileSizeBytes`       | Default 50 MiB                                  |
| `Uploads:AllowedExtensions`      | `.pdf`, `.epub`                                 |
| `Cors:AllowedOrigins`            | Angular dev origin (default `http://localhost:4200`) |

## API surface

All routes are prefixed with `/api`. Protected routes require
`Authorization: Bearer <jwt>`.

### `/api/auth`
| Method | Route       | Auth | Body                                      |
|--------|-------------|------|-------------------------------------------|
| POST   | `/register` | No   | `{ username, email, password }`           |
| POST   | `/login`    | No   | `{ identifier, password }` — email or username |
| GET    | `/me`       | Yes  | —                                         |

### `/api/books` (Gutendex passthrough + Redis cache)
| Method | Route             | Auth | Query                  |
|--------|-------------------|------|------------------------|
| GET    | `/`               | No   | `?search=...&page=1`   |
| GET    | `/:gutendexId`    | No   | —                      |

### `/api/saved-books` (auth required)
| Method | Route            | Body                              |
|--------|------------------|-----------------------------------|
| GET    | `/`              | —                                 |
| POST   | `/`              | `{ gutendexBookId, title?, authors?, coverImageUrl? }` |
| DELETE | `/:gutendexId`   | —                                 |

### `/api/uploads` (auth required)
| Method | Route          | Content-Type           | Notes                         |
|--------|----------------|------------------------|-------------------------------|
| GET    | `/`            | —                      | List user uploads             |
| POST   | `/`            | `multipart/form-data`  | Fields: `title`, `author`, `description`; files: `bookFile`, `coverImage?` |
| GET    | `/:id`         | —                      | Metadata                      |
| PUT    | `/:id`         | `application/json`     | `{ title?, author?, description? }` |
| DELETE | `/:id`         | —                      | Removes DB row + files        |
| GET    | `/:id/file`    | —                      | Streams PDF/EPUB (range-enabled) |

### `/api/authors`
| Method | Route              | Auth | Query                  |
|--------|--------------------|------|------------------------|
| GET    | `/`                | No   | `?q=<search>`          |
| GET    | `/:id`             | No   | Biography + book IDs   |
| GET    | `/:id/books`       | No   | Resolved Gutendex books |

## Error response shape

```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

Codes: `NOT_FOUND`, `CONFLICT`, `UNAUTHORIZED`, `FORBIDDEN`,
`VALIDATION_ERROR`, `INTERNAL_ERROR`.

## Notes

- `uploads/` is per-user (subdirectory = user id). Files are stored with
  GUID names; the original filename is preserved in `file_name`.
- The Gutendex client uses `IHttpClientFactory` and Redis-cached `GET`s.
  First hit fills cache; subsequent hits within TTL skip the external call.
- Run-time DB migration on startup is convenient for dev. For prod, drop
  the `Migrate()` call and apply migrations manually as part of deploy.
