using Microsoft.EntityFrameworkCore;
using Redanto.API.Models;

namespace Redanto.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<SavedBook> SavedBooks => Set<SavedBook>();
    public DbSet<UploadedBook> UploadedBooks => Set<UploadedBook>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<AuthorBook> AuthorBooks => Set<AuthorBook>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("id");
            e.Property(u => u.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
            e.Property(u => u.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
            e.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            e.Property(u => u.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(u => u.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<SavedBook>(e =>
        {
            e.ToTable("saved_books");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.UserId).HasColumnName("user_id");
            e.Property(s => s.GutendexBookId).HasColumnName("gutendex_book_id");
            e.Property(s => s.Title).HasColumnName("title").HasMaxLength(500);
            e.Property(s => s.Authors).HasColumnName("authors");
            e.Property(s => s.CoverImageUrl).HasColumnName("cover_image_url");
            e.Property(s => s.SavedAt).HasColumnName("saved_at").HasDefaultValueSql("NOW()");
            e.HasIndex(s => new { s.UserId, s.GutendexBookId }).IsUnique();
            e.HasIndex(s => s.UserId);
            e.HasOne(s => s.User)
                .WithMany(u => u.SavedBooks)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UploadedBook>(e =>
        {
            e.ToTable("uploaded_books");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("id");
            e.Property(u => u.UserId).HasColumnName("user_id");
            e.Property(u => u.Title).HasColumnName("title").HasMaxLength(500).IsRequired();
            e.Property(u => u.Author).HasColumnName("author").HasMaxLength(255);
            e.Property(u => u.Description).HasColumnName("description");
            e.Property(u => u.FilePath).HasColumnName("file_path").HasMaxLength(1000).IsRequired();
            e.Property(u => u.FileName).HasColumnName("file_name").HasMaxLength(255).IsRequired();
            e.Property(u => u.FileType).HasColumnName("file_type").HasMaxLength(10).IsRequired();
            e.Property(u => u.FileSizeBytes).HasColumnName("file_size_bytes");
            e.Property(u => u.CoverImagePath).HasColumnName("cover_image_path").HasMaxLength(1000);
            e.Property(u => u.UploadedAt).HasColumnName("uploaded_at").HasDefaultValueSql("NOW()");
            e.Property(u => u.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
            e.HasIndex(u => u.UserId);
            e.HasOne(u => u.User)
                .WithMany(usr => usr.UploadedBooks)
                .HasForeignKey(u => u.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Author>(e =>
        {
            e.ToTable("authors");
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasColumnName("id");
            e.Property(a => a.GutendexAuthorName).HasColumnName("gutendex_author_name").HasMaxLength(255).IsRequired();
            e.Property(a => a.BirthYear).HasColumnName("birth_year");
            e.Property(a => a.DeathYear).HasColumnName("death_year");
            e.Property(a => a.Biography).HasColumnName("biography");
            e.Property(a => a.PortraitUrl).HasColumnName("portrait_url").HasMaxLength(1000);
            e.Property(a => a.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(a => a.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
            e.HasIndex(a => a.GutendexAuthorName).IsUnique();
        });

        modelBuilder.Entity<AuthorBook>(e =>
        {
            e.ToTable("author_books");
            e.HasKey(ab => new { ab.AuthorId, ab.GutendexBookId });
            e.Property(ab => ab.AuthorId).HasColumnName("author_id");
            e.Property(ab => ab.GutendexBookId).HasColumnName("gutendex_book_id");
            e.HasIndex(ab => ab.AuthorId);
            e.HasOne(ab => ab.Author)
                .WithMany(a => a.AuthorBooks)
                .HasForeignKey(ab => ab.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
