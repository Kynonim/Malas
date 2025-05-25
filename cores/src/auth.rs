use crate::struc::JWTKadaluarsa;
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Validation, Header};
use std::env;

pub fn buat_token_jwt(email: &str) -> Result<String, jsonwebtoken::errors::Error> {
  let secret = env::var("JWT_SECRET").expect("JWT_SECRET tidak ditemukan");

  let kadaluarsa = Utc::now()
    .checked_add_signed(Duration::hours(24))
    .expect("Gagal menambahkan waktu")
    .timestamp() as usize;

  let jwt = JWTKadaluarsa {
    data: email.to_string(),
    exp: kadaluarsa,
  };

  return encode(&Header::default(), &jwt, &EncodingKey::from_secret(secret.as_ref()));
}

pub fn verifikasi_token_jwt(token: &str) -> Result<JWTKadaluarsa, jsonwebtoken::errors::Error> {
  let secret = env::var("JWT_SECRET").expect("JWT_SECRET tidak ditemukan");

  return decode::<JWTKadaluarsa>(
    token,
    &DecodingKey::from_secret(secret.as_ref()),
    &Validation::default(),
  ).map(|data| data.claims);
}