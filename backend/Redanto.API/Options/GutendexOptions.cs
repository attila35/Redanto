namespace Redanto.API.Options;

public class GutendexOptions
{
    public const string SectionName = "Gutendex";

    public string BaseUrl { get; set; } = "https://gutendex.com/";
    public int SearchCacheTtlSeconds { get; set; } = 259200;
    public int BookCacheTtlSeconds { get; set; } = 604800;
}
