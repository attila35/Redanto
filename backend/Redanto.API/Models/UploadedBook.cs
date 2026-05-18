namespace Redanto.API.Models;

public class UploadedBook
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string? Author { get; set; }
    public string? Description { get; set; }
    public string FilePath { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string FileType { get; set; } = null!;
    public long? FileSizeBytes { get; set; }
    public string? CoverImagePath { get; set; }
    public DateTime UploadedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
