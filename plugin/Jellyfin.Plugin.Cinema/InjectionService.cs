using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.Cinema;

/// <summary>Registers a File Transformation callback that adds the Cinema script to index.html before first paint.</summary>
public sealed class InjectionService : IHostedService
{
    private static readonly Guid TransformId = Guid.Parse("2c9a4f1d-6b7e-4d8a-8a52-0f3e7b9c1d10");
    private readonly ILogger<InjectionService> _logger;
    private CancellationTokenSource? _cts;

    public InjectionService(ILogger<InjectionService> logger) => _logger = logger;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _cts = new CancellationTokenSource();
        _ = Task.Run(() => RegisterLoop(_cts.Token), CancellationToken.None);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _cts?.Cancel();
        return Task.CompletedTask;
    }

    private async Task RegisterLoop(CancellationToken ct)
    {
        for (var i = 0; i < 90 && !ct.IsCancellationRequested; i++)
        {
            try
            {
                if (TryRegister())
                {
                    _logger.LogInformation("Cinema: registered index.html transformation with File Transformation");
                    return;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cinema: could not register with File Transformation (attempt {Attempt})", i + 1);
            }

            await Task.Delay(TimeSpan.FromSeconds(2), ct).ConfigureAwait(false);
        }

        _logger.LogWarning("Cinema: File Transformation not found. The UI script must be loaded another way (for example JavaScript Injector with src /Cinema/ui.js).");
    }

    private static bool TryRegister()
    {
        var ft = AssemblyLoadContext.All.SelectMany(c => c.Assemblies)
            .FirstOrDefault(a => a.FullName?.Contains(".FileTransformation", StringComparison.Ordinal) == true);
        var type = ft?.GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");
        var method = type?.GetMethod("RegisterTransformation", BindingFlags.Public | BindingFlags.Static);
        if (method is null)
        {
            return false;
        }

        var json = JsonSerializer.Serialize(new
        {
            id = TransformId,
            fileNamePattern = "index.html",
            callbackAssembly = typeof(InjectionService).Assembly.FullName,
            callbackClass = typeof(TransformCallbacks).FullName,
            callbackMethod = nameof(TransformCallbacks.PatchIndex)
        });

        var paramType = method.GetParameters()[0].ParameterType;
        object payload;
        if (paramType == typeof(string))
        {
            payload = json;
        }
        else
        {
            var parse = paramType.GetMethod("Parse", BindingFlags.Public | BindingFlags.Static, new[] { typeof(string) })
                ?? throw new InvalidOperationException("Unsupported payload type " + paramType);
            payload = parse.Invoke(null, new object[] { json })!;
        }

        method.Invoke(null, new[] { payload });
        return true;
    }
}

public class PatchRequestPayload
{
    [JsonPropertyName("contents")]
    public string? Contents { get; set; }
}

public static class TransformCallbacks
{
    private const string Marker = "Cinema/ui.js";

    public static string PatchIndex(PatchRequestPayload payload)
    {
        var html = payload.Contents ?? string.Empty;
        if (Plugin.Instance?.Configuration.InjectEarly == false || html.Contains(Marker, StringComparison.Ordinal))
        {
            return html;
        }

        const string Tag = "<style id=\"cx-critical\">html:not(.cx-ready):not(.cx-off) #reactRoot{opacity:0;animation:cxrv .01s 3s forwards}@keyframes cxrv{to{opacity:1}}</style><script src=\"../Cinema/ui.js\"></script>";
        var idx = html.IndexOf("</head>", StringComparison.OrdinalIgnoreCase);
        return idx < 0 ? html + Tag : html.Insert(idx, Tag);
    }
}
