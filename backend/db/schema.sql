-- Redanto — PostgreSQL schema
-- Run this once to create the database schema if you are NOT using
-- EF Core migrations (the Program.cs Migrate() call is otherwise the
-- preferred path).
--
-- Usage:
--   createdb redanto
--   psql -d redanto -f db/schema.sql

BEGIN;

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- saved_books
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_books (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gutendex_book_id  INTEGER NOT NULL,
    title             VARCHAR(500),
    authors           TEXT,
    cover_image_url   TEXT,
    saved_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_saved_books_user_book UNIQUE (user_id, gutendex_book_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_books_user_id ON saved_books(user_id);

-- ============================================================
-- uploaded_books
-- ============================================================
CREATE TABLE IF NOT EXISTS uploaded_books (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title             VARCHAR(500)  NOT NULL,
    author            VARCHAR(255),
    description       TEXT,
    file_path         VARCHAR(1000) NOT NULL,
    file_name         VARCHAR(255)  NOT NULL,
    file_type         VARCHAR(10)   NOT NULL CHECK (file_type IN ('pdf', 'epub')),
    file_size_bytes   BIGINT,
    cover_image_path  VARCHAR(1000),
    uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uploaded_books_user_id ON uploaded_books(user_id);

-- ============================================================
-- authors
-- ============================================================
CREATE TABLE IF NOT EXISTS authors (
    id                    SERIAL PRIMARY KEY,
    gutendex_author_name  VARCHAR(255) UNIQUE NOT NULL,
    birth_year            INTEGER,
    death_year            INTEGER,
    biography             TEXT,
    portrait_url          VARCHAR(1000),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- author_books (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS author_books (
    author_id         INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    gutendex_book_id  INTEGER NOT NULL,
    PRIMARY KEY (author_id, gutendex_book_id)
);
CREATE INDEX IF NOT EXISTS idx_author_books_author_id ON author_books(author_id);

COMMIT;
