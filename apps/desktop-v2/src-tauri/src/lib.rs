#[cfg_attr(mobile, tauri::mobile_entry_point)]
mod apple_script;
mod hello;
mod menu;
mod server;
mod util;

use rusqlite::{Connection, ParamsFromIter, Result, ToSql};
use std::thread;
use tauri::{LogicalSize, Manager, Runtime, Size, Window, WebviewWindow};
use util::{convert_all_app_icons_to_png, handle_input, open_command};
use window_shadows::set_shadow;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};

#[cfg(target_os = "macos")]
use cocoa::appkit::{NSWindow, NSWindowButton, NSWindowStyleMask, NSWindowTitleVisibility};

#[cfg(target_os = "macos")]
use objc::runtime::YES;

#[tauri::command]
fn greet(name: &str) {
    hello::say_hello(name)
}

#[tauri::command]
fn set_window_properties(window: Window, resizable: bool, width: f64, height: f64, focus: bool) {
    window.set_resizable(resizable).unwrap();
    window
        .set_size(Size::Logical(LogicalSize { width, height }))
        .unwrap();

    let _ = window.center();

    if focus {
        window.set_focus().unwrap();
    }
}

async fn get_data_from_webview(app_handle: &tauri::AppHandle) -> String {
    let event_name = "get_data_from_rust";
    let (tx, rx) = std::sync::mpsc::channel();
    app_handle.emit(event_name, Some("yes")).unwrap();
    let data = rx.recv().unwrap();
    data
}

pub trait WindowExt {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool);
}

impl<R: Runtime> WindowExt for WebviewWindow<R> {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, title_transparent: bool, remove_tool_bar: bool) {
        use objc::{msg_send, sel, sel_impl};

        unsafe {
            let id = self.ns_window().unwrap() as cocoa::base::id;
            NSWindow::setTitlebarAppearsTransparent_(id, cocoa::base::YES);
            let mut style_mask = id.styleMask();
            style_mask.set(
                NSWindowStyleMask::NSFullSizeContentViewWindowMask,
                title_transparent,
            );

            id.setStyleMask_(style_mask);

            if remove_tool_bar {
                let close_button = id.standardWindowButton_(NSWindowButton::NSWindowCloseButton);
                let _: () = msg_send![close_button, setHidden: YES];
                let min_button =
                    id.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton);
                let _: () = msg_send![min_button, setHidden: YES];
                let zoom_button = id.standardWindowButton_(NSWindowButton::NSWindowZoomButton);
                let _: () = msg_send![zoom_button, setHidden: YES];
            }

            id.setTitleVisibility_(if title_transparent {
                NSWindowTitleVisibility::NSWindowTitleHidden
            } else {
                NSWindowTitleVisibility::NSWindowTitleVisible
            });

            id.setTitlebarAppearsTransparent_(if title_transparent {
                cocoa::base::YES
            } else {
                cocoa::base::NO
            });
        }
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard::init())
        .invoke_handler(tauri::generate_handler![
            menu::on_button_clicked,
            greet,
            apple_script::run_applescript,
            set_window_properties,
            convert_all_app_icons_to_png,
            open_command,
            handle_input
        ])
        // .system_tray(menu::create_system_tray())
        // .on_system_tray_event(|app, event| match event {
        //     SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
        //         "Hide" => {
        //             let window = app.get_window("main").unwrap();
        //             window.hide().unwrap();
        //         }
        //         "Show" => {
        //             let window = app.get_window("main").unwrap();
        //             window.show().unwrap();
        //             window.center().unwrap();
        //         }
        //         // "Preferences" => {
        //         //     let window = app.get_window("main").unwrap();
        //         //     window.emit("PreferencesClicked", Some("Yes")).unwrap();
        //         //     window.show().unwrap();
        //         //     window.center().unwrap();
        //         // }
        //         "Quit" => {
        //             std::process::exit(0);
        //         }
        //         _ => {}
        //     },
        //     _ => {}
        // })
        .setup(|mut app| {
            let handle = app.handle();
            let conn = Connection::open_in_memory();

            // let boxed_handle = Box::new(handle);
            let boxed_conn = Box::new(conn.unwrap());

            let app_state = server::AppState {
                app_name: String::from("Actix Web"),
                data: String::from("initial data"),
            };
            // should listen or listen_any be used?
            app.listen_any("get_data_from_webview", move |event| {
                let data = event.payload();
                // *app_state.data.borrow_mut() = data.to_string();
                // *app_state.app_name.borrow_mut() = data.to_string();
            });
            // app.listen_global("get_data_from_webview", move |event| {
            //     let data = event.payload().unwrap();
            //     // *app_state.data.borrow_mut() = data.to_string();
            //     // *app_state.app_name.borrow_mut() = data.to_string();
            // });

            let boxed_app_state = Box::new(app_state);
            let app_handle = app.handle().clone();
            thread::spawn(move || {
                server::start_server(app_handle, *boxed_conn, *boxed_app_state).unwrap()
            });

            let window = app.get_webview_window("main").unwrap();
            // TODO
            // set_shadow(&window, true).expect("Unsupported platform!");

            #[cfg(target_os = "macos")]
            window.set_transparent_titlebar(true, true);
            // window.set_skip_taskbar(skip)

            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // #[cfg(target_os = "macos")]
            // apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
            //     .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            // #[cfg(target_os = "windows")]
            // apply_blur(&window, Some((18, 18, 18, 125)))
            //     .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
