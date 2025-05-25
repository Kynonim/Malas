mod db;
mod struc;
mod router;
mod auth;

use axum::Router;
use std::sync::Arc;
use tower_http::services::fs::ServeDir;

#[tokio::main]
async fn main() {
  dotenvy::dotenv().ok();
  let koneksi = Arc::new(db::koneksi().await);
  let api = router::buat_routes(koneksi.clone());

  let app: Router = Router::new()
    .nest("/api", api)
    .fallback_service(ServeDir::new("./views/dist"));
  println!("Server running at http://localhost:3000");

  let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
  axum::serve(listener, app.into_make_service()).await.unwrap();
}