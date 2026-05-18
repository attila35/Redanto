using Redanto.API.Models;

namespace Redanto.API.Repositories;

public interface IUploadedBookRepository
{
    Task<List<UploadedBook>> GetByUserAsync(int userId, CancellationToken ct = default);
    Task<UploadedBook?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(UploadedBook book, CancellationToken ct = default);
    void Remove(UploadedBook book);
    Task SaveChangesAsync(CancellationToken ct = default);
}
