use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use std::path::Path;

pub async fn koneksi() -> SqlitePool {
  let dbpath = "./data/malas.sqlite";
  if !Path::new(dbpath).exists() {
    std::fs::File::create(dbpath).unwrap();
  }
  let db = SqlitePoolOptions::new()
    .max_connections(5)
    .connect("sqlite:./data/malas.sqlite").await
    .expect("Terjadi masalah saat koneksi ke SQLite");

  sqlx::query(
    r#"
    Create Table If Not Exists orang (
      id Integer Primary Key Autoincrement,
      nama Text Not Null,
      uname Text Not Null Unique,
      email Text Not Null Unique,
      sandi Text Not Null,
      verify Boolean Default False,
      avatar Text Default Null,
      timestamp Text Default Current_Timestamp
    );
    "#
  ).execute(&db).await.unwrap();

  return db;
}