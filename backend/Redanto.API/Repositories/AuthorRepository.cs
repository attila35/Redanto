using Microsoft.EntityFrameworkCore;
using Redanto.API.Data;
using Redanto.API.Models;

namespace Redanto.API.Repositories;

public class AuthorRepository : IAuthorRepository
{
    private readonly AppDbContext _db;

    public AuthorRepository(AppDbContext db) => _db = db;

    public Task<List<Author>> SearchAsync(string? query, CancellationToken ct = default)
    {
        var q = _db.Authors.AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
            q = q.Where(a => EF.Functions.ILike(a.GutendexAuthorName, $"%{query}%"));
        return q.OrderBy(a => a.GutendexAuthorName).Take(50).ToListAsync(ct);
    }

    public Task<Author?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Authors.FirstOrDefaultAsync(a => a.Id == id, ct);

    public Task<Author?> GetByNameAsync(string name, CancellationToken ct = default) =>
        _db.Authors.FirstOrDefaultAsync(a => a.GutendexAuthorName == name, ct);

    public Task<Author?> GetWithBooksAsync(int id, CancellationToken ct = default) =>
        _db.Authors
            .Include(a => a.AuthorBooks)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task AddAsync(Author author, CancellationToken ct = default) =>
        await _db.Authors.AddAsync(author, ct);

    public async Task AddBookLinkAsync(AuthorBook link, CancellationToken ct = default) =>
        await _db.AuthorBooks.AddAsync(link, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        _db.SaveChangesAsync(ct);
}
