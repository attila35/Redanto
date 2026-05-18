namespace Redanto.API.DTOs;

public record GutendexSearchResponse(
    int Count,
    string? Next,
    string? Previous,
    List<GutendexBookDto> Results
);

public record GutendexBookDto(
    int Id,
    string Title,
    List<GutendexAuthorDto> Authors,
    List<string> Subjects,
    List<string> Languages,
    Dictionary<string, string> Formats,
    int DownloadCount
);

public record GutendexAuthorDto(
    string Name,
    int? BirthYear,
    int? DeathYear
);
