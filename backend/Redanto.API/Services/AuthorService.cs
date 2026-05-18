using Redanto.API.DTOs;
using Redanto.API.Exceptions;
using Redanto.API.Repositories;

namespace Redanto.API.Services;

public class AuthorService : IAuthorService
{
    private readonly IAuthorRepository _repo;
    private readonly IGutendexService _gutendex;

    public AuthorService(IAuthorRepository repo, IGutendexService gutendex)
    {
        _repo = repo;
        _gutendex = gutendex;
    }

    public async Task<List<AuthorDto>> SearchAsync(string? query, CancellationToken ct = default)
    {
        var authors = await _repo.SearchAsync(query, ct);
        return authors.Select(a => new AuthorDto(
            a.Id, a.GutendexAuthorName, a.BirthYear, a.DeathYear, a.Biography, a.PortraitUrl)).ToList();
    }

    public async Task<AuthorDetailDto> GetAsync(int id, CancellationToken ct = default)
    {
        var author = await _repo.GetWithBooksAsync(id, ct)
            ?? throw new NotFoundException("Author not found.");

        return new AuthorDetailDto(
            author.Id,
            author.GutendexAuthorName,
            author.BirthYear,
            author.DeathYear,
            author.Biography,
            author.PortraitUrl,
            author.AuthorBooks.Select(ab => ab.GutendexBookId).ToList());
    }

    public async Task<List<GutendexBookDto>> GetBooksAsync(int id, CancellationToken ct = default)
    {
        var author = await _repo.GetWithBooksAsync(id, ct)
            ?? throw new NotFoundException("Author not found.");

        var books = new List<GutendexBookDto>();
        foreach (var link in author.AuthorBooks)
        {
            var book = await _gutendex.GetBookAsync(link.GutendexBookId, ct);
            if (book is not null) books.Add(book);
        }
        return books;
    }
}
