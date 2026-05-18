using System.ComponentModel.DataAnnotations;

namespace Redanto.API.DTOs;

public record SaveBookRequest(
    [Required] int GutendexBookId,
    string? Title,
    string? Authors,
    string? CoverImageUrl
);

public record SavedBookDto(
    int Id,
    int GutendexBookId,
    string? Title,
    string? Authors,
    string? CoverImageUrl,
    DateTime SavedAt
);
