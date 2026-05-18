using Redanto.API.Models;

namespace Redanto.API.Repositories;

public interface ISavedBookRepository
{
    Task<List<SavedBook>> GetByUserAsync(int userId, CancellationToken ct = default);
    Task<SavedBook?> GetByUserAndBookAsync(int userId, int gutendexBookId, CancellationToken ct = default);
    Task AddAsync(SavedBook book, CancellationToken ct = default);
    void Remove(SavedBook book);
    Task SaveChangesAsync(CancellationToken ct = default);
}
