/* Strongly-typed shapes for everything coming from the API.
   Field names are camelCase to match ASP.NET Core's default serializer. */

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface GutendexAuthor {
  name: string;
  birthYear: number | null;
  deathYear: number | null;
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  subjects: string[];
  languages: string[];
  formats: Record<string, string>;
  downloadCount: number;
}

export interface GutendexSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

export interface SavedBook {
  id: number;
  gutendexBookId: number;
  title: string | null;
  authors: string | null;
  coverImageUrl: string | null;
  savedAt: string;
}

export interface UploadedBook {
  id: number;
  title: string;
  author: string | null;
  description: string | null;
  fileName: string;
  fileType: 'pdf' | 'epub';
  fileSizeBytes: number | null;
  coverImagePath: string | null;
  uploadedAt: string;
}

export interface Author {
  id: number;
  name: string;
  birthYear: number | null;
  deathYear: number | null;
  biography: string | null;
  portraitUrl: string | null;
}

export interface AuthorDetail extends Author {
  gutendexBookIds: number[];
}

export interface ApiError {
  error: string;
  code: string;
}
