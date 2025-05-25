use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Orang {
  pub id: i64,
  pub nama: String,
  pub uname: String,
  pub email: String,
  pub sandi: String,
  pub verify: bool,
  pub avatar: Option<String>,
  pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Register {
  pub nama: String,
  pub uname: String,
  pub email: String,
  pub sandi: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Login {
  pub email: String,
  pub sandi: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JWTKadaluarsa {
  pub data: String,
  pub exp: usize,
}