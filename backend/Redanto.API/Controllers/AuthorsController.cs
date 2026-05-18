using Microsoft.AspNetCore.Mvc;
using Redanto.API.DTOs;
using Redanto.API.Services;

namespace Redanto.API.Controllers;

[ApiController]
[Route("api/authors")]
public class AuthorsController : ControllerBase
{
    private readonly IAuthorService _authors;

    public AuthorsController(IAuthorService authors) => _authors = authors;

    [HttpGet]
    [ProducesResponseType(typeof(List<AuthorDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AuthorDto>>> Search(
        [FromQuery] string? q, CancellationToken ct) =>
        Ok(await _authors.SearchAsync(q, ct));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(AuthorDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuthorDetailDto>> Get(int id, CancellationToken ct) =>
        Ok(await _authors.GetAsync(id, ct));

    [HttpGet("{id:int}/books")]
    [ProducesResponseType(typeof(List<GutendexBookDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GutendexBookDto>>> Books(int id, CancellationToken ct) =>
        Ok(await _authors.GetBooksAsync(id, ct));
}
