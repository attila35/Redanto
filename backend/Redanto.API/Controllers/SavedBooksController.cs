using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Redanto.API.DTOs;
using Redanto.API.Extensions;
using Redanto.API.Services;

namespace Redanto.API.Controllers;

[ApiController]
[Authorize]
[Route("api/saved-books")]
public class SavedBooksController : ControllerBase
{
    private readonly ISavedBookService _saved;

    public SavedBooksController(ISavedBookService saved) => _saved = saved;

    [HttpGet]
    [ProducesResponseType(typeof(List<SavedBookDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SavedBookDto>>> List(CancellationToken ct) =>
        Ok(await _saved.GetForUserAsync(User.GetUserId(), ct));

    [HttpPost]
    [ProducesResponseType(typeof(SavedBookDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<SavedBookDto>> Save(
        [FromBody] SaveBookRequest request, CancellationToken ct)
    {
        var dto = await _saved.SaveAsync(User.GetUserId(), request, ct);
        return StatusCode(StatusCodes.Status201Created, dto);
    }

    [HttpDelete("{gutendexId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remove(int gutendexId, CancellationToken ct)
    {
        await _saved.RemoveAsync(User.GetUserId(), gutendexId, ct);
        return NoContent();
    }
}
