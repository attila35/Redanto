using Redanto.API.DTOs;

namespace Redanto.API.Services;

public interface IGutendexService
{
    Task<GutendexSearchResponse> SearchAsync(string? search, int page, CancellationToken ct = default);
    Task<GutendexBookDto?> GetBookAsync(int id, CancellationToken ct = default);
}
