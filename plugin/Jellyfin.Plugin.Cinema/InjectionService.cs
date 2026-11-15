using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Jellyfin.Plugin.Cinema;

/// <summary>Adds the Cinema script to the web client's index.html before it reaches the browser. No other plugin needed.</summary>
public sealed class IndexInjectionStartupFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            app.UseMiddleware<IndexInjectionMiddleware>();
            next(app);
        };
    }
}

public sealed class IndexInjectionMiddleware
{
    private const string Marker = "Cinema/ui.js";
    private const string Tag = "<style id=\"cx-critical\">html:not(.cx-ready):not(.cx-off) #reactRoot{opacity:0;animation:cxrv .01s 3s forwards}@keyframes cxrv{to{opacity:1}}</style><script src=\"../Cinema/ui.js\"></script>";
    private readonly RequestDelegate _next;

    public IndexInjectionMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var path = (context.Request.Path.Value ?? string.Empty).TrimEnd('/');
        var isIndex = path.EndsWith("/web/index.html", StringComparison.OrdinalIgnoreCase)
            || path.Equals("/web", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith("/web", StringComparison.OrdinalIgnoreCase)
            || string.IsNullOrEmpty(path);
        if (!isIndex || Plugin.Instance?.Configuration.InjectEarly == false || !HttpMethods.IsGet(context.Request.Method))
        {
            await _next(context).ConfigureAwait(false);
            return;
        }

        // ask the pipeline for an uncompressed, unconditional response so the body can be edited
        context.Request.Headers.Remove("Accept-Encoding");
        context.Request.Headers.Remove("If-None-Match");
        context.Request.Headers.Remove("If-Modified-Since");

        var original = context.Response.Body;
        using var buffer = new MemoryStream();
        context.Response.Body = buffer;
        try
        {
            await _next(context).ConfigureAwait(false);
        }
        finally
        {
            context.Response.Body = original;
        }

        var bytes = buffer.ToArray();
        var type = context.Response.ContentType ?? string.Empty;
        if (context.Response.StatusCode == StatusCodes.Status200OK && type.Contains("text/html", StringComparison.OrdinalIgnoreCase) && bytes.Length > 0)
        {
            var html = Encoding.UTF8.GetString(bytes);
            if (!html.Contains(Marker, StringComparison.Ordinal))
            {
                var idx = html.IndexOf("</head>", StringComparison.OrdinalIgnoreCase);
                html = idx < 0 ? html + Tag : html.Insert(idx, Tag);
                bytes = Encoding.UTF8.GetBytes(html);
            }
        }

        if (!context.Response.HasStarted)
        {
            context.Response.ContentLength = bytes.Length;
        }

        if (bytes.Length > 0)
        {
            await original.WriteAsync(bytes).ConfigureAwait(false);
        }
    }
}
