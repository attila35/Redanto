using Redanto.API.DTOs;

namespace Redanto.API.Services;

public interface IUploadService
{
    Task<List<UploadedBookDto>> GetForUserAsync(int userId, CancellationToken ct = default);
    Task<UploadedBookDto> GetAsync(int userId, int id, CancellationToken ct = default);
    Task<UploadedBookDto> CreateAsync(int userId, UploadBookRequest request, CancellationToken ct = default);
    Task<UploadedBookDto> UpdateAsync(int userId, int id, UpdateUploadRequest request, CancellationToken ct = default);
    Task DeleteAsync(int userId, int id, CancellationToken ct = default);
    Task<(Stream Stream, string ContentType, string FileName)> OpenFileAsync(int userId, int id, CancellationToken ct = default);
}
