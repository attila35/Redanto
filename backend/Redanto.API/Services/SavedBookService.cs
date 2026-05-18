using Redanto.API.DTOs;
using Redanto.API.Exceptions;
using Redanto.API.Models;
using Redanto.API.Repositories;

namespace Redanto.API.Services;

public class SavedBookService : ISavedBookService
{
    private readonly ISavedBookRepository _repo;

    public SavedBookService(ISavedBookRepository repo) => _repo = repo;

    public async Task<List<SavedBookDto>> GetForUserAsync(int userId, CancellationToken ct = default)
    {
        var books = await _repo.GetByUserAsync(userId, ct);
        return books.Select(ToDto).ToList();
    }

    public async Task<SavedBookDto> SaveAsync(int userId, SaveBookRequest request, CancellationToken ct = default)
    {
        var existing = await _repo.GetByUserAndBookAsync(userId, request.GutendexBookId, ct);
        if (existing is not null)
            return ToDto(existing);

        var book = new SavedBook
        {
            UserId = userId,
            GutendexBookId = request.GutendexBookId,
            Title = request.Title,
            Authors = request.Authors,
            CoverImageUrl = request.CoverImageUrl,
            SavedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(book, ct);
        await _repo.SaveChangesAsync(ct);
        return ToDto(book);
    }

    public async Task RemoveAsync(int userId, int gutendexBookId, CancellationToken ct = default)
    {
        var existing = await _repo.GetByUserAndBookAsync(userId, gutendexBookId, ct)
            ?? throw new NotFoundException("Saved book not found.");
        _repo.Remove(existing);
        await _repo.SaveChangesAsync(ct);
    }

    private static SavedBookDto ToDto(SavedBook b) =>
        new(b.Id, b.GutendexBookId, b.Title, b.Authors, b.CoverImageUrl, b.SavedAt);
}
