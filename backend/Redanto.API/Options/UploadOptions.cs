namespace Redanto.API.Options;

public class UploadOptions
{
    public const string SectionName = "Uploads";

    public string RootPath { get; set; } = "uploads";
    public long MaxFileSizeBytes { get; set; } = 52_428_800;
    public string[] AllowedExtensions { get; set; } = new[] { ".pdf", ".epub" };
}
