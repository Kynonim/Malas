import { existsSync, readFileSync, writeFileSync } from "fs"
import { dekripsi, enkripsi } from "./keys/kunci"

const databasePath = process.env.DATABASE_PATH ?? ""

/**
 * simpan data ke database
 * @param data
 * @returns kosong lah
 */

async function SimpanDataKeDatabase(data: any) : Promise<void> {
    const encrypt = enkripsi(data)
    writeFileSync(databasePath, await encrypt, "utf8")
}

/**
 * mebaca data dari database
 * @param ?
 * @returns data json/object
 */

async function BacaDataDariDatabase() : Promise<Record<string, any> | null> {
    if (!existsSync(databasePath)) {
        await SimpanDataKeDatabase({"Author": "Riky Ripaldo", "Dibuat": new Date().toLocaleDateString()})
        return null
    }
    const encrypt = readFileSync(databasePath, "utf8")
    return dekripsi(encrypt)
}

/**
 * mencocokan data ke database
 * @param email 
 * @param sandi 
 * @returns response json/object
 */

export async function SigninAkun(akun: any) : Promise<{ status: boolean; message: string }> {
    const { email, sandi } = akun
    if (!email || !sandi) return { status: false, message: "Data tidak lengkap" }
    if (email.length < 5 || sandi.length < 5) return { status: false, message: "Email dan Sandi terlalu pendek" }
    if (!email.includes("@") && !email.includes(".") || email.includes("\"\'")) return { status: false, message: "Email tidak valid" }
    if (sandi.length > 16) return { status: false, message: "Sandi terlalu panjang" }

    let data = await BacaDataDariDatabase() ?? []
    data = Array.isArray(data) ? data : [data]
    const user = data.find((user: any) => user.email === email && user.sandi === sandi)
    
    if (!user) {
        return { status: false, message: "Email atau Sandi salah" }
    } else {
        return { status: true, message: "Berhasil login" }
    }
}

/**
 * membuat data ke database
 * @param nama 
 * @param email 
 * @param sandi 
 * @returns response json/object
 */

export async function SignupAkun(akun: any): Promise<{ status: boolean; message: string }> {
    const { nama, email, sandi } = akun
    if (!nama || !email || !sandi) return { status: false, message: "Data tidak lengkap" }
    if (email.length < 5 || sandi.length < 5) return { status: false, message: "Email dan Sandi terlalu pendek" }
    if (!email.includes("@") && !email.includes(".") || email.includes("\"\'")) return { status: false, message: "Email tidak valid" }
    if (sandi.length > 16) return { status: false, message: "Sandi terlalu panjang" }

    let data = await BacaDataDariDatabase() ?? []
    data = Array.isArray(data) ? data : [data]
    const emailExists = data.find((item: any) => item.email === email)

    if (emailExists) {
         return { status: false, message: "Email sudah terdaftar" }
    } else {
        data.push(akun)
        await SimpanDataKeDatabase(data)
        return { "status": true, "message": "Akun berhasil dibuat" }
    }
}

/**
 * baca data pengguna
 * jika email cocok
 * @param data
 * @returns boolean/object(string)
 */

export async function BacaDataPengguna(data: any): Promise<{ status: boolean; message: string; data: any }> {
    if (!data.email) {
        return { status: false, message: "Data tidak lengkap", data: null }
    } else {
        const database = await BacaDataDariDatabase()
        if (!database) {
            return { status: false, message: "Database tidak tersedia", data: null }
        }
        const user = database.rikyxdz.find((user: any) => user.email === data.email)
        if (!user) {
            return { status: false, message: "Email tidak ditemukan", data: null }
        } else {
            return { status: true, message: "Berhasil membaca postingan", data: user }
        }
    }
}

/**
 * ubah data pengguna
 * jika email cocok
 * @param data 
 * @returns boolean/object(string)
 */

export async function UbahDataPengguna(data: any): Promise<{ status: boolean; message: string; data: any }> {
    if (!data.email) {
        return { status: false, message: "Data tidak lengkap", data: null }
    } else {
        let database = await BacaDataDariDatabase()
        database = Array.isArray(database) ? database : [database]
        if (!database) {
            return { status: false, message: "Database tidak tersedia", data: null }
        }
        const user = database.rikyxdz.find((user: any) => user.email === data.email)
        if (!user) {
            return { status: false, message: "Email tidak ditemukan", data: null }
        } else {
            user.nama = data.nama
            user.email = data.email
            user.sandi = data.sandi
            await SimpanDataKeDatabase(database)
            return { status: true, message: "Berhasil membaca postingan", data: user }
        }
    }
}

/**
 * baca semua pengguna
 * @returns boolean/object(string)
 */

export async function BacaSemuaPengguna(): Promise<{ status: boolean; message: string; data: any }> {
    const database = await BacaDataDariDatabase()
    if (!database) {
        return { status: false, message: "Database tidak tersedia", data: null }
    }
    return { status: true, message: "Berhasil membaca postingan", data: database }
}