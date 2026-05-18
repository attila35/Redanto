namespace Redanto.API.DTOs;

public record AuthorDto(
    int Id,
    string Name,
    int? BirthYear,
    int? DeathYear,
    string? Biography,
    string? PortraitUrl
);

public record AuthorDetailDto(
    int Id,
    string Name,
    int? BirthYear,
    int? DeathYear,
    string? Biography,
    string? PortraitUrl,
    List<int> GutendexBookIds
);
