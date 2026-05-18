using Redanto.API.DTOs;

namespace Redanto.API.Services;

public interface IAuthorService
{
    Task<List<AuthorDto>> SearchAsync(string? query, CancellationToken ct = default);
    Task<AuthorDetailDto> GetAsync(int id, CancellationToken ct = default);
    Task<List<GutendexBookDto>> GetBooksAsync(int id, CancellationToken ct = default);
}
