import { randomBytes } from "crypto"
import { writeFileSync, readFileSync, existsSync } from "fs"

const unicodeId = randomBytes(16).toString("hex")
const databasePath = process.env.POSTINGAN_PATH ?? ""

/**
 * buat atau perbarui postingan
 * @param data 
 */

const updateDatabase = async (data: any): Promise<boolean> => {
    let database = await BacaDataDariDatabase() ?? []
    database = Array.isArray(database) ? database : [database]
    const user = database.findIndex((user: any) => user?.rikyxdz?.email === data.email)
    if (user === -1) {
        const update = {
            nama: data.nama,
            email: data.email,
            konten: {
                [unicodeId]: {
                    judul: data?.konten?.judul,
                    isi: data?.konten?.isi,
                    tanggal: new Date().toLocaleDateString()
                }
            }
        }
        database?.rikyxdz?.push(update)
        writeFileSync(databasePath, JSON.stringify(database))
        return true
    } else {
        database[user].rikyxdz.konten[unicodeId] = {
            judul: data?.konten?.judul,
            isi: data?.konten?.isi,
            tanggal: new Date().toLocaleDateString()
        }
        writeFileSync(databasePath, JSON.stringify(database))
        return true
    }
}

/**
 * baca postingan dari database
 * @returns data json/object
 */

async function BacaDataDariDatabase() {
    if (!existsSync(databasePath)) {
        const dbs = {
            Author: "Riky Ripaldo",
            Dibuat: new Date().toLocaleDateString(),
            rikyxdz: {
                nama: "Riky Ripaldo",
                email: "rikyripaldo@gmail.com",
                konten: {}
            }
        } as Object
        await writeFileSync(databasePath, JSON.stringify(dbs))
        return null
    } else {
        const database = readFileSync(databasePath, "utf8")
        return JSON.parse(database)
    }
}

/**
 * membuat postingan
 * @param data 
 * @returns boolean/object(string)
 */

export async function BuatPostingan(data: any): Promise<{ status: boolean; message: string }> {
    if (!data.email || !data.konten) {
        return { status: false, message: "Data tidak lengkap" }
    } else {
        await updateDatabase(data).then(async (result) => {
            if (!result) {
                return { status: false, message: "Email tidak ditemukan" }
            } else {
                return { status: true, message: "Berhasil membuat postingan" }
            }
        })
        return { status: false, message: "Posrtingan loading" }
    }
}

/**
 * membaca postingan
 * @param data 
 * @returns boolean/object(string)
 */

export async function BacaPostingan(): Promise<{ status: boolean; message: string; data: any }> {
    let database = await BacaDataDariDatabase() ?? []
    if (!database) {
        return { status: false, message: "Postingan tidak ditemukan", data: null }
    } else {
        return { status: true, message: "Berhasil membaca postingan", data: database }
    }
}