import { randomBytes, verify } from "crypto"
import { writeFileSync, readFileSync, existsSync } from "fs"

const databasePath = process.env.POSTINGAN_PATH ?? ""

/**
 * buat atau perbarui postingan
 * @param data 
 * @returns boolean
 */

const updateDatabase = async (data: any) => {
    let database = await BacaDataDariDatabase() ?? {}
    const unicode = randomBytes(16).toString("hex")
    
    database = typeof database === "object" && !Array.isArray(database) ? database : {}
    const user = Object.keys(database).find((key) => database[key].email === data?.email)
    console.log(JSON.stringify(user))   

    if (!user) {
        const kunci = data?.kunci ?? randomBytes(8).toString("hex")
        database[kunci] = {
            nama: data?.nama,
            email: data?.email,
            profil: data?.profil,
            verify: data?.verify,
            kunci: kunci,
            konten: {
                [unicode]: {
                    judul: data?.konten?.judul,
                    isi: data?.konten?.isi,
                    media: data?.konten?.media,
                    key: unicode,
                    tanggal: {
                        hari: new Date().toLocaleDateString(),
                        waktu: new Date().toLocaleTimeString()
                    }
                }
            }
        }
       console.log(`Email: ${data?.email} membuat postingan pada ${new Date().toLocaleString()}`)
    } else {
        database[user].konten[unicode] = {
            judul: data?.konten?.judul,
            isi: data?.konten?.isi,
            media: data?.konten?.media,
            key: unicode,
            tanggal: {
                hari: new Date().toLocaleDateString(),
                waktu: new Date().toLocaleTimeString()
            }
        }
        console.log(`Email: ${data?.email} Menambah postingan pada ${new Date().toLocaleString()}`)
    }
    writeFileSync(databasePath, JSON.stringify(database))
}

/**
 * baca postingan dari database
 * @returns data json/object
 */

async function BacaDataDariDatabase() {
    if (!existsSync(databasePath)) {
        const dbs = {
            Author: "Riky Ripaldo",
            Dibuat: new Date().toLocaleString()
        } as Object
        writeFileSync(databasePath, JSON.stringify(dbs))
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
    if (!data?.email || !data?.konten) {
        return { status: false, message: "Data tidak lengkap" }
    } else {
        await updateDatabase(data)
        return { status: true, message: "Berhasil membuat postingan" }
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