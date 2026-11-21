using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>The link a network speaker plays. It cannot sign in, so the link itself is the key: signed, valid for one song, expires after a few hours.</summary>
[ApiController]
[Route("Cinema/cast")]
public class CastController : ControllerBase
{
    [HttpGet("{token}/{name?}")]
    [HttpHead("{token}/{name?}")]
    [AllowAnonymous]
    public IActionResult Stream(string token, string? name)
    {
        if (!SpeakerService.Enabled)
        {
            return NotFound();
        }

        var id = SpeakerService.Verify(token);
        var path = id is null ? null : SpeakerService.PathFor(id);
        if (path is null)
        {
            return NotFound();
        }

        Response.Headers["transferMode.dlna.org"] = "Streaming";
        Response.Headers["contentFeatures.dlna.org"] = "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000";
        return PhysicalFile(path, SpeakerService.Mime(path), enableRangeProcessing: true);
    }
}
