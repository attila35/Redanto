using Microsoft.EntityFrameworkCore;
using Redanto.API.Data;
using Redanto.API.Models;

namespace Redanto.API.Repositories;

public class SavedBookRepository : ISavedBookRepository
{
    private readonly AppDbContext _db;

    public SavedBookRepository(AppDbContext db) => _db = db;

    public Task<List<SavedBook>> GetByUserAsync(int userId, CancellationToken ct = default) =>
        _db.SavedBooks
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.SavedAt)
            .ToListAsync(ct);

    public Task<SavedBook?> GetByUserAndBookAsync(int userId, int gutendexBookId, CancellationToken ct = default) =>
        _db.SavedBooks.FirstOrDefaultAsync(
            s => s.UserId == userId && s.GutendexBookId == gutendexBookId, ct);

    public async Task AddAsync(SavedBook book, CancellationToken ct = default) =>
        await _db.SavedBooks.AddAsync(book, ct);

    public void Remove(SavedBook book) => _db.SavedBooks.Remove(book);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        _db.SaveChangesAsync(ct);
}
