use sqlx::SqlitePool;
use std::{sync::Arc};
use axum::{http::{HeaderMap, StatusCode},routing::{get, post},Extension, Json, Router};
use argon2::{Argon2, password_hash::{SaltString, PasswordHasher}};
use crate::struc::{Login, Orang, Register};
use crate::auth::{buat_token_jwt, verifikasi_token_jwt};

pub fn buat_routes(db: Arc<SqlitePool>) -> Router {
  return Router::new()
    .route("/ingat_tujuan_awal", get(get_semua_orang))
    .route("/index_php.rs", post(register))
    .route("/index_php.rs", get(get_orang))
    .route("/index.html", post(login))
    .layer(Extension(db));
}

async fn register(Extension(db): Extension<Arc<SqlitePool>>, Json(data): Json<Register>) -> Result<Json<Orang>, (StatusCode, String)> {
  let is_ada = sqlx::query_as::<_, Orang>("SELECT id FROM orang WHERE uname = ? OR email = ?")
    .bind(&data.uname)
    .bind(&data.email)
    .fetch_optional(&*db)
    .await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

  if is_ada.is_some() {
    return Err((StatusCode::BAD_REQUEST, "Username atau email sudah terdaftar".into()));
  }

  //let enk_pass = enkripsi_sandi(&data.sandi)?;
  let enk_pass = &data.sandi;

  let orang = sqlx::query_as::<_, Orang>("INSERT INTO orang (nama, uname, email, sandi) VALUES (?, ?, ?, ?) RETURNING *")
    .bind(&data.nama)
    .bind(&data.uname)
    .bind(&data.email)
    .bind(enk_pass)
    .fetch_one(&*db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Gagal membuat user".into()))?;

  return Ok(Json(orang));
}

async fn login(Extension(db): Extension<Arc<SqlitePool>>, Json(data): Json<Login>) -> Result<Json<String>, StatusCode> {
  let orang = sqlx::query_as::<_, Orang>("SELECT * FROM orang WHERE email = ?")
    .bind(&data.email)
    .fetch_optional(&*db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  if let Some(orang) = orang {
    //verifi hash di sini (tapi nanti sekarang malas)
    if orang.sandi == data.sandi {
      let token = buat_token_jwt(&orang.email).map_err(|_| StatusCode::UNAUTHORIZED)?;
      return Ok(Json(token));
    }
  }

  return Err(StatusCode::UNAUTHORIZED);
}

async fn get_orang(headers: HeaderMap, Extension(db): Extension<Arc<SqlitePool>>) -> Result<Json<Orang>, StatusCode> {
  let token = headers
    .get("Authorization")
    .and_then(|x| x.to_str().ok())
    .and_then(|y| y.strip_prefix("Bearer "))
    .ok_or(StatusCode::UNAUTHORIZED)?;

  let kadaluarsa = verifikasi_token_jwt(token).map_err(|_| StatusCode::UNAUTHORIZED)?;
  let orang = sqlx::query_as::<_, Orang>("SELECT * FROM orang WHERE email = ?")
    .bind(&kadaluarsa.data)
    .fetch_optional(&*db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  return orang.map(Json).ok_or(StatusCode::UNAUTHORIZED);
}

async fn get_semua_orang(Extension(db): Extension<Arc<SqlitePool>>) -> Json<Vec<Orang>> {
  let orang = sqlx::query_as::<_, Orang>("SELECT * FROM orang")
    .fetch_all(&*db)
    .await
    .expect("Gagal mendapatkan data users");
  return Json(orang);
}

#[warn(dead_code)]
fn enkripsi_sandi(sandi: &str) -> Result<String, (StatusCode, String)> {
  let salt_str = std::env::var("ARGON2_SALT").map_err(|_| {
    (StatusCode::INTERNAL_SERVER_ERROR, "ARGON2_SALT tidak ditemukan".into())
  })?;
  
  let salt = SaltString::from_b64(&salt_str).map_err(|_| {
    (StatusCode::INTERNAL_SERVER_ERROR, "Salt tidak valid".into())
  })?;

  let argon2 = Argon2::default();
  let hash = argon2
    .hash_password(sandi.as_bytes(), &salt)
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Hashing gagal".into()))?
    .to_string();

  return Ok(hash);
}
