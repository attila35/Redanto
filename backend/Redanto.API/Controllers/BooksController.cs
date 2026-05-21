using Microsoft.AspNetCore.Mvc;
using Redanto.API.DTOs;
using Redanto.API.Services;

namespace Redanto.API.Controllers;

[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly IGutendexService _gutendex;

    public BooksController(IGutendexService gutendex) => _gutendex = gutendex;

    [HttpGet]
    [ProducesResponseType(typeof(GutendexSearchResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<GutendexSearchResponse>> Search(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        CancellationToken ct = default)
    {
        var result = await _gutendex.SearchAsync(search, page < 1 ? 1 : page, ct);
        return Ok(result);
    }

    [HttpGet("{gutendexId:int}")]
    [ProducesResponseType(typeof(GutendexBookDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GutendexBookDto>> Get(int gutendexId, CancellationToken ct)
    {
        var book = await _gutendex.GetBookAsync(gutendexId, ct);
        return book is null ? NotFound() : Ok(book);
    }

    [HttpGet("{gutendexId:int}/content")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetContent(int gutendexId, CancellationToken ct)
    {
        var html = await _gutendex.GetBookContentAsync(gutendexId, ct);
        if (html is null) return NotFound();
        return Content(html, "text/html; charset=utf-8");
    }
}
