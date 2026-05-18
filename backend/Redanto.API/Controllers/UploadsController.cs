using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Redanto.API.DTOs;
using Redanto.API.Extensions;
using Redanto.API.Services;

namespace Redanto.API.Controllers;

[ApiController]
[Authorize]
[Route("api/uploads")]
public class UploadsController : ControllerBase
{
    private readonly IUploadService _uploads;

    public UploadsController(IUploadService uploads) => _uploads = uploads;

    [HttpGet]
    [ProducesResponseType(typeof(List<UploadedBookDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UploadedBookDto>>> List(CancellationToken ct) =>
        Ok(await _uploads.GetForUserAsync(User.GetUserId(), ct));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UploadedBookDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UploadedBookDto>> Get(int id, CancellationToken ct) =>
        Ok(await _uploads.GetAsync(User.GetUserId(), id, ct));

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(52_428_800)]
    [ProducesResponseType(typeof(UploadedBookDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<UploadedBookDto>> Create(
        [FromForm] UploadBookRequest request, CancellationToken ct)
    {
        var dto = await _uploads.CreateAsync(User.GetUserId(), request, ct);
        return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(UploadedBookDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UploadedBookDto>> Update(
        int id, [FromBody] UpdateUploadRequest request, CancellationToken ct) =>
        Ok(await _uploads.UpdateAsync(User.GetUserId(), id, request, ct));

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _uploads.DeleteAsync(User.GetUserId(), id, ct);
        return NoContent();
    }

    [HttpGet("{id:int}/file")]
    public async Task<IActionResult> File(int id, CancellationToken ct)
    {
        var (stream, contentType, fileName) = await _uploads.OpenFileAsync(User.GetUserId(), id, ct);
        return File(stream, contentType, fileName, enableRangeProcessing: true);
    }
}
