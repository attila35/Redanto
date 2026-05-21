using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Redanto.API.DTOs;
using Redanto.API.Options;

namespace Redanto.API.Services;

public class GutendexService : IGutendexService
{
    private readonly HttpClient _http;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IDistributedCache _cache;
    private readonly GutendexOptions _opts;
    private readonly ILogger<GutendexService> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public GutendexService(
        HttpClient http,
        IHttpClientFactory httpFactory,
        IDistributedCache cache,
        IOptions<GutendexOptions> opts,
        ILogger<GutendexService> logger)
    {
        _http = http;
        _httpFactory = httpFactory;
        _cache = cache;
        _opts = opts.Value;
        _logger = logger;
        if (_http.BaseAddress is null)
            _http.BaseAddress = new Uri(_opts.BaseUrl);
    }

    public async Task<GutendexSearchResponse> SearchAsync(string? search, int page, CancellationToken ct = default)
    {
        var key = $"gutendex:search:{search ?? "_all"}:{page}";
        var cached = await _cache.GetStringAsync(key, ct);
        if (cached is not null)
        {
            _logger.LogDebug("Gutendex search cache HIT: {Key}", key);
            return JsonSerializer.Deserialize<GutendexSearchResponse>(cached, JsonOpts)!;
        }

        var url = $"books/?page={page}";
        if (!string.IsNullOrWhiteSpace(search))
            url += $"&search={Uri.EscapeDataString(search)}";

        var response = await _http.GetFromJsonAsync<GutendexSearchResponse>(url, JsonOpts, ct)
            ?? new GutendexSearchResponse(0, null, null, new());

        await _cache.SetStringAsync(
            key,
            JsonSerializer.Serialize(response, JsonOpts),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(_opts.SearchCacheTtlSeconds)
            },
            ct);

        _logger.LogDebug("Gutendex search cache MISS: {Key}", key);
        return response;
    }

    public async Task<GutendexBookDto?> GetBookAsync(int id, CancellationToken ct = default)
    {
        var key = $"gutendex:book:{id}";
        var cached = await _cache.GetStringAsync(key, ct);
        if (cached is not null)
            return JsonSerializer.Deserialize<GutendexBookDto>(cached, JsonOpts);

        try
        {
            var book = await _http.GetFromJsonAsync<GutendexBookDto>($"books/{id}/", JsonOpts, ct);
            if (book is null) return null;

            await _cache.SetStringAsync(
                key,
                JsonSerializer.Serialize(book, JsonOpts),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(_opts.BookCacheTtlSeconds)
                },
                ct);

            return book;
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<string?> GetBookContentAsync(int id, CancellationToken ct = default)
    {
        var book = await GetBookAsync(id, ct);
        if (book is null) return null;

        var htmlUrl = book.Formats.GetValueOrDefault("text/html")
            ?? book.Formats.GetValueOrDefault("text/html; charset=utf-8")
            ?? book.Formats.Keys
                   .Where(k => k.StartsWith("text/html"))
                   .Select(k => book.Formats[k])
                   .FirstOrDefault();

        if (htmlUrl is null) return null;

        var client = _httpFactory.CreateClient("GutenbergContent");
        try
        {
            // Gutenberg redirects HTTPS → HTTP; SocketsHttpHandler blocks protocol
            // downgrades automatically, so we follow the redirect manually.
            var response = await client.GetAsync(htmlUrl, HttpCompletionOption.ResponseHeadersRead, ct);

            if ((int)response.StatusCode is >= 300 and < 400 && response.Headers.Location is { } loc)
            {
                var finalUrl = loc.IsAbsoluteUri ? loc : new Uri(new Uri(htmlUrl), loc);
                response = await client.GetAsync(finalUrl, HttpCompletionOption.ResponseHeadersRead, ct);
            }

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch book content from {Url}", htmlUrl);
            return null;
        }
    }
}
