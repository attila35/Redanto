using Redanto.API.Models;

namespace Redanto.API.Repositories;

public interface IAuthorRepository
{
    Task<List<Author>> SearchAsync(string? query, CancellationToken ct = default);
    Task<Author?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Author?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<Author?> GetWithBooksAsync(int id, CancellationToken ct = default);
    Task AddAsync(Author author, CancellationToken ct = default);
    Task AddBookLinkAsync(AuthorBook link, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
