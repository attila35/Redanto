using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Redanto.API.DTOs;

public class UploadBookRequest
{
    [Required, StringLength(500)]
    public string Title { get; set; } = null!;

    [StringLength(255)]
    public string? Author { get; set; }

    public string? Description { get; set; }

    [Required]
    public IFormFile BookFile { get; set; } = null!;

    public IFormFile? CoverImage { get; set; }
}

public class UpdateUploadRequest
{
    [StringLength(500)]
    public string? Title { get; set; }

    [StringLength(255)]
    public string? Author { get; set; }

    public string? Description { get; set; }
}

public record UploadedBookDto(
    int Id,
    string Title,
    string? Author,
    string? Description,
    string FileName,
    string FileType,
    long? FileSizeBytes,
    string? CoverImagePath,
    DateTime UploadedAt
);
