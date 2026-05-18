namespace Redanto.API.Models;

public class Author
{
    public int Id { get; set; }
    public string GutendexAuthorName { get; set; } = null!;
    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
    public string? Biography { get; set; }
    public string? PortraitUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<AuthorBook> AuthorBooks { get; set; } = new List<AuthorBook>();
}
