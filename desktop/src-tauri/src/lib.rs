use std::{fs, path::PathBuf, time::Duration};

use serde::{Deserialize, Serialize};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};
use tauri_plugin_deep_link::DeepLinkExt;
#[allow(unused_imports)]
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Shortcut, ShortcutState};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_window_state::{StateFlags, WindowExt};
use url::Url;

const KEYRING_SERVICE: &str = "net.dafric.cinema.desktop";
const MAX_CREDENTIAL_LEN: usize = 16 * 1024;

#[derive(Serialize, Deserialize, Default, Clone)]
struct Config {
    /// Server base address, no trailing slash, e.g. https://jellyfin.example.com
    server: Option<String>,
}

#[derive(Serialize)]
struct ServerInfo {
    name: String,
    version: String,
    id: String,
}

// ---------- config + keystore ----------

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("config.json"))
}

fn load_config(app: &AppHandle) -> Config {
    config_path(app)
        .ok()
        .and_then(|p| fs::read_to_string(p).ok())
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn save_config(app: &AppHandle, cfg: &Config) -> Result<(), String> {
    let s = serde_json::to_string_pretty(cfg).map_err(|e| e.to_string())?;
    fs::write(config_path(app)?, s).map_err(|e| e.to_string())
}

fn keyring_entry(origin: &str) -> Result<keyring::Entry, String> {
    keyring::Entry::new(KEYRING_SERVICE, origin).map_err(|e| e.to_string())
}

fn origin_of(server: &str) -> Option<String> {
    Url::parse(server).ok().map(|u| u.origin().ascii_serialization())
}

/// Accepts "host", "host:port", "http(s)://host/path"; returns a normalised base URL.
fn normalize_server(input: &str) -> Result<String, String> {
    let mut s = input.trim().to_string();
    if s.is_empty() {
        return Err("Enter the server address.".into());
    }
    if !s.contains("://") {
        s = format!("https://{s}");
    }
    let mut u = Url::parse(&s).map_err(|_| "That is not a valid address.".to_string())?;
    if u.scheme() != "http" && u.scheme() != "https" {
        return Err("Only http and https addresses are supported.".into());
    }
    if u.host_str().is_none() {
        return Err("That is not a valid address.".into());
    }
    u.set_query(None);
    u.set_fragment(None);
    let mut path = u.path().trim_end_matches('/').to_string();
    if let Some(i) = path.to_lowercase().find("/web") {
        path.truncate(i);
    }
    u.set_path(&path);
    Ok(u.as_str().trim_end_matches('/').to_string())
}

// ---------- origin guards ----------

fn is_local_url(u: &Url) -> bool {
    u.scheme() == "tauri" || matches!(u.host_str(), Some("tauri.localhost"))
}

fn caller_is_local(w: &WebviewWindow) -> bool {
    w.url().map(|u| is_local_url(&u)).unwrap_or(false)
}

fn caller_is_server(app: &AppHandle, w: &WebviewWindow) -> Option<String> {
    let server = load_config(app).server?;
    let origin = origin_of(&server)?;
    let cur = w.url().ok()?;
    (cur.origin().ascii_serialization() == origin).then_some(origin)
}

// ---------- commands ----------

#[tauri::command]
fn get_server(app: AppHandle) -> Option<String> {
    load_config(&app).server
}

fn short_err(e: &reqwest::Error) -> &'static str {
    if e.is_timeout() {
        "timed out"
    } else if e.is_connect() {
        "connection failed"
    } else {
        "request failed"
    }
}

#[tauri::command]
async fn check_server(input: String) -> Result<ServerInfo, String> {
    let base = normalize_server(&input)?;
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .redirect(reqwest::redirect::Policy::limited(3))
        .build()
        .map_err(|e| e.to_string())?;
    let resp = client
        .get(format!("{base}/System/Info/Public"))
        .send()
        .await
        .map_err(|e| format!("Could not reach the server: {}", short_err(&e)))?;
    if !resp.status().is_success() {
        return Err(format!("The server answered with HTTP {}.", resp.status().as_u16()));
    }
    let text = resp.text().await.map_err(|e| e.to_string())?;
    let v: serde_json::Value =
        serde_json::from_str(&text).map_err(|_| "That address is not a Jellyfin server.".to_string())?;
    let id = v.get("Id").and_then(|x| x.as_str()).unwrap_or_default().to_string();
    if id.is_empty() {
        return Err("That address is not a Jellyfin server.".into());
    }
    Ok(ServerInfo {
        name: v.get("ServerName").and_then(|x| x.as_str()).unwrap_or("Jellyfin").to_string(),
        version: v.get("Version").and_then(|x| x.as_str()).unwrap_or("?").to_string(),
        id,
    })
}

#[tauri::command]
async fn set_server(app: AppHandle, window: WebviewWindow, input: String) -> Result<(), String> {
    if !caller_is_local(&window) {
        return Err("not allowed".into());
    }
    check_server(input.clone()).await?;
    let base = normalize_server(&input)?;
    save_config(&app, &Config { server: Some(base) })?;
    app.restart()
}

#[tauri::command]
fn store_credentials(app: AppHandle, window: WebviewWindow, value: String) -> Result<(), String> {
    let origin = caller_is_server(&app, &window).ok_or("not allowed")?;
    if value.len() > MAX_CREDENTIAL_LEN || serde_json::from_str::<serde_json::Value>(&value).is_err() {
        return Err("invalid credentials".into());
    }
    keyring_entry(&origin)?.set_password(&value).map_err(|e| e.to_string())
}

#[tauri::command]
fn clear_credentials(app: AppHandle, window: WebviewWindow) -> Result<(), String> {
    let origin = caller_is_server(&app, &window).ok_or("not allowed")?;
    match keyring_entry(&origin)?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn open_external(app: AppHandle, window: WebviewWindow, url: String) -> Result<(), String> {
    caller_is_server(&app, &window).ok_or("not allowed")?;
    open_url_external(&app, &url)
}

#[tauri::command]
fn exit_app(app: AppHandle, window: WebviewWindow) -> Result<(), String> {
    caller_is_server(&app, &window).ok_or("not allowed")?;
    app.exit(0);
    Ok(())
}

#[tauri::command]
fn toggle_fullscreen(app: AppHandle, window: WebviewWindow) -> Result<(), String> {
    caller_is_server(&app, &window).ok_or("not allowed")?;
    let fs = window.is_fullscreen().map_err(|e| e.to_string())?;
    window.set_fullscreen(!fs).map_err(|e| e.to_string())
}

/// Sets window full screen (`on`), or toggles it when `on` is missing. Returns the state before the call,
/// so the player can put the window back the way it found it.
#[tauri::command]
fn set_fullscreen(app: AppHandle, window: WebviewWindow, on: Option<bool>) -> Result<bool, String> {
    caller_is_server(&app, &window).ok_or("not allowed")?;
    let was = window.is_fullscreen().map_err(|e| e.to_string())?;
    let want = on.unwrap_or(!was);
    if want != was {
        window.set_fullscreen(want).map_err(|e| e.to_string())?;
        if !want {
            let _ = window.set_focus();
        }
    }
    Ok(was)
}

fn open_url_external(app: &AppHandle, url: &str) -> Result<(), String> {
    let u = Url::parse(url).map_err(|_| "invalid url".to_string())?;
    if u.scheme() != "http" && u.scheme() != "https" {
        return Err("only http(s) links can be opened".into());
    }
    app.opener().open_url(u.as_str(), None::<&str>).map_err(|e| e.to_string())
}

// ---------- window ----------

fn init_script(app: &AppHandle, server: &str) -> String {
    let origin = origin_of(server).unwrap_or_default();
    let creds = keyring_entry(&origin).ok().and_then(|e| e.get_password().ok());
    let cfg = serde_json::json!({
        "origin": origin,
        "appVersion": app.package_info().version.to_string(),
        "os": std::env::consts::OS,
        "creds": creds,
    });
    format!("window.__CINEMA_CFG = {cfg};\n{}", include_str!("cinema-native.js"))
}

fn build_window(app: &AppHandle, cfg: &Config) -> tauri::Result<WebviewWindow> {
    let (url, script) = match &cfg.server {
        Some(s) => {
            // Runtime capability: IPC is allowed only for the configured server origin.
            if let Some(origin) = origin_of(s) {
                let cap = serde_json::json!({
                    "identifier": "server-origin",
                    "windows": ["main"],
                    "remote": { "urls": [format!("{origin}/*")] },
                    "permissions": ["allow-store-credentials", "allow-clear-credentials", "allow-open-external", "allow-exit-app", "allow-toggle-fullscreen", "allow-set-fullscreen"]
                });
                let _ = app.add_capability(cap.to_string());
            }
            let u: Url = format!("{s}/web/index.html").parse().expect("validated server url");
            (WebviewUrl::External(u), init_script(app, s))
        }
        None => (WebviewUrl::App("index.html".into()), String::new()),
    };
    let allowed_origin = cfg.server.as_deref().and_then(origin_of);
    let nav_app = app.clone();
    let mut b = WebviewWindowBuilder::new(app, "main", url)
        .title("Cinema")
        .inner_size(1280.0, 800.0)
        .min_inner_size(800.0, 500.0)
        .visible(false)
        .on_navigation(move |u| {
            if is_local_url(u) || allowed_origin.as_deref() == Some(u.origin().ascii_serialization().as_str()) {
                return true;
            }
            if u.scheme() == "http" || u.scheme() == "https" {
                let _ = open_url_external(&nav_app, u.as_str());
            }
            false
        });
    if !script.is_empty() {
        b = b.initialization_script(script);
    }
    // Release builds never open a remote-debugging port (WebView2 only does so with explicit args/env).
    // Windows: WebView2 itself publishes the page's Media Session (title, artist, cover, position, buttons) to the system
    // media overlay / lock screen and handles the hardware media keys, so there are no global shortcuts on Windows.
    #[cfg(windows)]
    {
        b = b.additional_browser_args(
            if cfg!(debug_assertions) { "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --remote-debugging-port=9333" } else { "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection" },
        );
    }
    let w = b.build()?;
    let _ = w.restore_state(StateFlags::all());
    w.show()?;
    Ok(w)
}

fn main_window(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window("main")
}

fn show_main(app: &AppHandle) {
    if let Some(w) = main_window(app) {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
    }
}

// ---------- deep links: cinema://item/<id>, cinema://c/quiz ----------

fn deep_link_hash(u: &Url) -> Option<String> {
    if u.scheme() != "cinema" {
        return None;
    }
    let host = u.host_str().unwrap_or_default();
    let rest: Vec<&str> = u.path().split('/').filter(|s| !s.is_empty()).collect();
    let ok = |s: &str| {
        !s.is_empty() && s.len() <= 64 && s.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    };
    match (host, rest.as_slice()) {
        ("item", [id]) if ok(id) => Some(format!("#/details?id={id}")),
        ("c", [page]) if ok(page) => Some(format!("#/c/{page}")),
        ("home", []) => Some("#/home".to_string()),
        _ => None,
    }
}

fn handle_deep_links(app: &AppHandle, urls: Vec<Url>) {
    let Some(hash) = urls.iter().find_map(deep_link_hash) else { return };
    show_main(app);
    if let Some(w) = main_window(app) {
        if caller_is_server(app, &w).is_some() {
            let _ = w.eval(format!("location.hash = {};", serde_json::to_string(&hash).unwrap()));
        } else if let Some(server) = load_config(app).server {
            if let Ok(u) = format!("{server}/web/index.html{hash}").parse::<Url>() {
                let _ = w.navigate(u);
            }
        }
    }
}

// ---------- tray ----------

fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "Open Cinema", true, None::<&str>)?;
    let full = MenuItem::with_id(app, "fullscreen", "Toggle full screen", true, None::<&str>)?;
    let change = MenuItem::with_id(app, "change", "Change server...", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let menu = Menu::with_items(app, &[&open, &full, &sep1, &change, &sep2, &quit])?;
    let mut tray = TrayIconBuilder::with_id("main")
        .tooltip("Cinema")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, ev| match ev.id().as_ref() {
            "open" => show_main(app),
            "fullscreen" => {
                if let Some(w) = main_window(app) {
                    let fs = w.is_fullscreen().unwrap_or(false);
                    let _ = w.set_fullscreen(!fs);
                    let _ = w.show();
                }
            }
            "change" => {
                let _ = save_config(app, &Config::default());
                app.restart();
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, ev| {
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = ev {
                show_main(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        tray = tray.icon(icon.clone());
    }
    tray.build(app)?;
    Ok(())
}

// ---------- media keys ----------

#[cfg(not(windows))]
fn setup_media_keys(app: &AppHandle) {
    let gs = app.global_shortcut();
    for code in [Code::MediaPlayPause, Code::MediaStop, Code::MediaTrackNext, Code::MediaTrackPrevious] {
        let _ = gs.register(Shortcut::new(None, code)); // another app may own the key: not fatal
    }
}

#[cfg(not(windows))]
fn media_key_action(code: Code) -> Option<&'static str> {
    match code {
        Code::MediaPlayPause => Some("playpause"),
        Code::MediaStop => Some("stop"),
        Code::MediaTrackNext => Some("next"),
        Code::MediaTrackPrevious => Some("previous"),
        _ => None,
    }
}

// ---------- entry ----------

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| show_main(app)))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|#[allow(unused_variables)] app, #[allow(unused_variables)] shortcut, ev| {
                    if ev.state() != ShortcutState::Pressed {
                        return;
                    }
                    #[cfg(not(windows))]
                    if let Some(action) = media_key_action(shortcut.key) {
                        if let Some(w) = main_window(app) {
                            if caller_is_server(app, &w).is_some() {
                                let _ = w.eval(format!(
                                    "window.__cinemaMediaKey && window.__cinemaMediaKey('{action}')"
                                ));
                            }
                        }
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            get_server,
            check_server,
            set_server,
            store_credentials,
            clear_credentials,
            open_external,
            exit_app,
            toggle_fullscreen,
            set_fullscreen
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            let cfg = load_config(&handle);
            build_window(&handle, &cfg)?;
            setup_tray(&handle)?;
            #[cfg(not(windows))]
            setup_media_keys(&handle);

            #[cfg(any(windows, target_os = "linux"))]
            {
                // Registers cinema:// for unbundled/dev runs; installers register it themselves.
                let _ = app.deep_link().register_all();
            }
            let h = handle.clone();
            app.deep_link().on_open_url(move |ev| handle_deep_links(&h, ev.urls()));
            if let Ok(Some(urls)) = app.deep_link().get_current() {
                handle_deep_links(&handle, urls);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Cinema");
}
