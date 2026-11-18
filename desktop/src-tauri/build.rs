fn main() {
    // Every command gets an explicit allow-<name> permission, so each capability
    // grants exactly the commands its origin needs.
    let attrs = tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "get_server",
            "check_server",
            "set_server",
            "store_credentials",
            "clear_credentials",
            "open_external",
            "exit_app",
            "toggle_fullscreen",
            "set_fullscreen",
        ]),
    );
    tauri_build::try_build(attrs).expect("failed to run tauri-build")
}
