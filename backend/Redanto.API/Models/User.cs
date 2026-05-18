namespace Redanto.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<SavedBook> SavedBooks { get; set; } = new List<SavedBook>();
    public ICollection<UploadedBook> UploadedBooks { get; set; } = new List<UploadedBook>();
}
