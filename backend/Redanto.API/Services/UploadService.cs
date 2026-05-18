using Microsoft.Extensions.Options;
using Redanto.API.DTOs;
using Redanto.API.Exceptions;
using Redanto.API.Models;
using Redanto.API.Options;
using Redanto.API.Repositories;

namespace Redanto.API.Services;

public class UploadService : IUploadService
{
    private readonly IUploadedBookRepository _repo;
    private readonly UploadOptions _opts;
    private readonly string _rootPath;

    public UploadService(
        IUploadedBookRepository repo,
        IOptions<UploadOptions> opts,
        IWebHostEnvironment env)
    {
        _repo = repo;
        _opts = opts.Value;
        _rootPath = Path.IsPathRooted(_opts.RootPath)
            ? _opts.RootPath
            : Path.Combine(env.ContentRootPath, _opts.RootPath);
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<List<UploadedBookDto>> GetForUserAsync(int userId, CancellationToken ct = default)
    {
        var items = await _repo.GetByUserAsync(userId, ct);
        return items.Select(ToDto).ToList();
    }

    public async Task<UploadedBookDto> GetAsync(int userId, int id, CancellationToken ct = default)
    {
        var book = await GetOwnedOrThrowAsync(userId, id, ct);
        return ToDto(book);
    }

    public async Task<UploadedBookDto> CreateAsync(int userId, UploadBookRequest request, CancellationToken ct = default)
    {
        ValidateFile(request.BookFile);

        var ext = Path.GetExtension(request.BookFile.FileName).ToLowerInvariant();
        var fileType = ext.TrimStart('.');

        var userDir = Path.Combine(_rootPath, userId.ToString());
        Directory.CreateDirectory(userDir);

        var storedName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(userDir, storedName);

        await using (var fs = new FileStream(fullPath, FileMode.CreateNew))
        {
            await request.BookFile.CopyToAsync(fs, ct);
        }

        string? coverPath = null;
        if (request.CoverImage is { Length: > 0 })
        {
            var coverExt = Path.GetExtension(request.CoverImage.FileName).ToLowerInvariant();
            var coverName = $"{Guid.NewGuid():N}{coverExt}";
            var coverFull = Path.Combine(userDir, coverName);
            await using var cfs = new FileStream(coverFull, FileMode.CreateNew);
            await request.CoverImage.CopyToAsync(cfs, ct);
            coverPath = Path.Combine(userId.ToString(), coverName).Replace('\\', '/');
        }

        var book = new UploadedBook
        {
            UserId = userId,
            Title = request.Title,
            Author = request.Author,
            Description = request.Description,
            FilePath = Path.Combine(userId.ToString(), storedName).Replace('\\', '/'),
            FileName = request.BookFile.FileName,
            FileType = fileType,
            FileSizeBytes = request.BookFile.Length,
            CoverImagePath = coverPath,
            UploadedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(book, ct);
        await _repo.SaveChangesAsync(ct);
        return ToDto(book);
    }

    public async Task<UploadedBookDto> UpdateAsync(int userId, int id, UpdateUploadRequest request, CancellationToken ct = default)
    {
        var book = await GetOwnedOrThrowAsync(userId, id, ct);

        if (request.Title is not null) book.Title = request.Title;
        if (request.Author is not null) book.Author = request.Author;
        if (request.Description is not null) book.Description = request.Description;
        book.UpdatedAt = DateTime.UtcNow;

        await _repo.SaveChangesAsync(ct);
        return ToDto(book);
    }

    public async Task DeleteAsync(int userId, int id, CancellationToken ct = default)
    {
        var book = await GetOwnedOrThrowAsync(userId, id, ct);

        var fullPath = Path.Combine(_rootPath, book.FilePath);
        if (File.Exists(fullPath))
            File.Delete(fullPath);

        if (!string.IsNullOrEmpty(book.CoverImagePath))
        {
            var coverFull = Path.Combine(_rootPath, book.CoverImagePath);
            if (File.Exists(coverFull))
                File.Delete(coverFull);
        }

        _repo.Remove(book);
        await _repo.SaveChangesAsync(ct);
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> OpenFileAsync(
        int userId, int id, CancellationToken ct = default)
    {
        var book = await GetOwnedOrThrowAsync(userId, id, ct);
        var fullPath = Path.Combine(_rootPath, book.FilePath);
        if (!File.Exists(fullPath))
            throw new NotFoundException("File missing from disk.");

        var contentType = book.FileType switch
        {
            "pdf" => "application/pdf",
            "epub" => "application/epub+zip",
            _ => "application/octet-stream"
        };

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return (stream, contentType, book.FileName);
    }

    private async Task<UploadedBook> GetOwnedOrThrowAsync(int userId, int id, CancellationToken ct)
    {
        var book = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Uploaded book not found.");
        if (book.UserId != userId)
            throw new ForbiddenException("You do not own this resource.");
        return book;
    }

    private void ValidateFile(Microsoft.AspNetCore.Http.IFormFile file)
    {
        if (file.Length == 0)
            throw new ValidationException("File is empty.");
        if (file.Length > _opts.MaxFileSizeBytes)
            throw new ValidationException($"File exceeds maximum size of {_opts.MaxFileSizeBytes} bytes.");
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_opts.AllowedExtensions.Contains(ext))
            throw new ValidationException($"Only {string.Join(", ", _opts.AllowedExtensions)} files are allowed.");
    }

    private static UploadedBookDto ToDto(UploadedBook b) => new(
        b.Id, b.Title, b.Author, b.Description,
        b.FileName, b.FileType, b.FileSizeBytes,
        b.CoverImagePath, b.UploadedAt);
}
