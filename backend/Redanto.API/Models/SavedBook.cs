namespace Redanto.API.Models;

public class SavedBook
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int GutendexBookId { get; set; }
    public string? Title { get; set; }
    public string? Authors { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime SavedAt { get; set; }

    public User User { get; set; } = null!;
}
