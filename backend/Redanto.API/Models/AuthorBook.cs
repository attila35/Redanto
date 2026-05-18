namespace Redanto.API.Models;

public class AuthorBook
{
    public int AuthorId { get; set; }
    public int GutendexBookId { get; set; }

    public Author Author { get; set; } = null!;
}
