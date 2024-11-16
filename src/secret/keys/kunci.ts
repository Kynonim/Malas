import { createCipheriv, createDecipheriv } from "crypto"

const aesKey = process.env.AES_KEY ?? ""
const iv = process.env.IV_KEY ?? ""

/**
 * enkripsi data
 * @param data 
 * @returns string/object mungkin
 */

export function enkripsi(data: Record<string, any>): string {
    try {
        const cipher = createCipheriv('aes-256-cbc', aesKey, iv)
        let encrypt = cipher.update(JSON.stringify(data), 'utf8', 'base64')
        encrypt += cipher.final('base64')
        return encrypt
    } catch (error) {
        console.error("Enskripsi error: " + error)
        throw error
    }
}

/**
 * dekripsi data
 * @param data 
 * @returns object/array kalau ngak ada error
 */

export function dekripsi(data: string): any {
    try {
        const encrypt = data
        const decipher = createDecipheriv('aes-256-cbc', aesKey, iv)
        let decryptedData = decipher.update(encrypt, 'base64', 'utf8')
        decryptedData += decipher.final('utf8')
        return JSON.parse(decryptedData)
    } catch (error) {
        console.error("Deskripsi error: " + error)
        throw error
    }
}