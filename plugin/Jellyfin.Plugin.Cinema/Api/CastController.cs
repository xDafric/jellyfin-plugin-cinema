using System;
using System.Linq;
using System.Text.Json.Nodes;
using MediaBrowser.Controller.Library;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>Links for network speakers (found and controlled by the apps on the home network): the app asks for a link per song, the speaker plays it.</summary>
[ApiController]
[Route("Cinema/cast")]
public class CastController : ControllerBase
{
    private readonly IUserManager _users;

    public CastController(IUserManager users, ILibraryManager lib)
    {
        _users = users;
        CastLinks.Init(lib);
    }

    /// <summary>A signed link token for one song, valid for a few hours. Only for songs this user may see.</summary>
    [HttpPost("link")]
    [Authorize]
    public IActionResult Link([FromQuery] string id)
    {
        var uid = User.FindFirst("Jellyfin-UserId")?.Value;
        if (!CastLinks.Enabled || uid is null || !Guid.TryParse(uid, out var ug) || _users.GetUserById(ug) is not { } user || CastLinks.AudioOf(id) is not { } a || !a.IsVisible(user) || !System.IO.File.Exists(a.Path))
        {
            return NotFound();
        }

        var ext = System.IO.Path.GetExtension(a.Path).ToLowerInvariant();
        return Content(new JsonObject { ["token"] = CastLinks.Sign(a.Id.ToString("N"), TimeSpan.FromHours(8)), ["ext"] = ext, ["mime"] = CastLinks.Mime(a.Path) }.ToJsonString(), "application/json");
    }

    /// <summary>What the speaker fetches. It cannot sign in, so the link itself is the key.</summary>
    [HttpGet("{token}/{name?}")]
    [HttpHead("{token}/{name?}")]
    [AllowAnonymous]
    public IActionResult Stream(string token, string? name)
    {
        if (!CastLinks.Enabled)
        {
            return NotFound();
        }

        var id = CastLinks.Verify(token);
        var path = id is null ? null : CastLinks.PathFor(id);
        if (path is null)
        {
            return NotFound();
        }

        Response.Headers["transferMode.dlna.org"] = "Streaming";
        Response.Headers["contentFeatures.dlna.org"] = "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000";
        return PhysicalFile(path, CastLinks.Mime(path), enableRangeProcessing: true);
    }
}
