const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function randomCode(length = 7): string {
    // Not crypto-secure; good enough for training milestone 1
    let out = "";
    for (let i = 0; i < length; i++) {
        out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return out;
}