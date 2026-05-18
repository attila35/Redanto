using Microsoft.EntityFrameworkCore;
using Redanto.API.Data;
using Redanto.API.Models;

namespace Redanto.API.Repositories;

public class UploadedBookRepository : IUploadedBookRepository
{
    private readonly AppDbContext _db;

    public UploadedBookRepository(AppDbContext db) => _db = db;

    public Task<List<UploadedBook>> GetByUserAsync(int userId, CancellationToken ct = default) =>
        _db.UploadedBooks
            .Where(u => u.UserId == userId)
            .OrderByDescending(u => u.UploadedAt)
            .ToListAsync(ct);

    public Task<UploadedBook?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.UploadedBooks.FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task AddAsync(UploadedBook book, CancellationToken ct = default) =>
        await _db.UploadedBooks.AddAsync(book, ct);

    public void Remove(UploadedBook book) => _db.UploadedBooks.Remove(book);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        _db.SaveChangesAsync(ct);
}
