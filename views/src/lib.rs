use web_sys::{HtmlInputElement};
use yew::prelude::*;
use gloo_net::http::{Request};
use wasm_bindgen::prelude::*;

#[function_component(LoginPage)]
fn login_page() -> Html {
    let email = use_state(|| "".to_string());
    let sandi = use_state(|| "".to_string());
    let error_msg = use_state(|| None::<String>);

    let on_email_input = {
        let email = email.clone();
        Callback::from(move |e: InputEvent| {
            let input: HtmlInputElement = e.target_unchecked_into();
            email.set(input.value());
        })
    };

    let on_password_input = {
        let sandi = sandi.clone();
        Callback::from(move |e: InputEvent| {
            let input: HtmlInputElement = e.target_unchecked_into();
            sandi.set(input.value());
        })
    };

    let on_login = {
        let email = email.clone();
        let sandi = sandi.clone();
        let error_msg = error_msg.clone();

        Callback::from(move |_| {
            let email = email.clone();
            let sandi = sandi.clone();
            let error_msg = error_msg.clone();

            wasm_bindgen_futures::spawn_local(async move {
                error_msg.set(None);

                let body = serde_json::json!({
                    "email": *email,
                    "sandi": *sandi,
                });

                let res = Request::post("/api/index.html") // endpoint login Rust backend
                    .header("Content-Type", "application/json")
                    .body(serde_json::to_string(&body).unwrap())
                    .expect("Gagal membuat permintaan")
                    .send()
                    .await;

                match res {
                    Ok(res) if res.ok() => {
                        let token = res.text().await.unwrap();
                        if let Some(storage) = web_sys::window().unwrap().local_storage().unwrap() {
                            storage.set_item("token", &token).expect("Gagal simpan token");
                        }
                        web_sys::window().unwrap().location().reload().unwrap();
                    }
                    _ => {
                        error_msg.set(Some("Login gagal, cek email dan sandi.".to_string()));
                    }
                }
            });
        })
    };

    html! {
        <div class="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-md">
            <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">{ "Masuk Akun" }</h1>
            if let Some(err) = &*error_msg {
                <div class="mb-4 text-red-600 font-semibold text-center">{ err }</div>
            }
            <input
                class="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Email"
                value={(*email).clone()}
                oninput={on_email_input}
            />
            <input
                class="w-full mb-6 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                placeholder="Sandi"
                value={(*sandi).clone()}
                oninput={on_password_input}
            />
            <button
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
                onclick={on_login}
            >
                { "Masuk" }
            </button>
        </div>
    }
}

#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    yew::Renderer::<LoginPage>::with_root(web_sys::window()
        .unwrap()
        .document()
        .unwrap()
        .query_selector("main")?
        .unwrap())
    .render();
    Ok(())
}