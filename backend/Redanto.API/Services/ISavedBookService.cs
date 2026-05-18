using Redanto.API.DTOs;

namespace Redanto.API.Services;

public interface ISavedBookService
{
    Task<List<SavedBookDto>> GetForUserAsync(int userId, CancellationToken ct = default);
    Task<SavedBookDto> SaveAsync(int userId, SaveBookRequest request, CancellationToken ct = default);
    Task RemoveAsync(int userId, int gutendexBookId, CancellationToken ct = default);
}
