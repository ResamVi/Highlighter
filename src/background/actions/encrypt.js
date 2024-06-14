const CRYPTO_ALGORITHM = 'AES-GCM';

function generateKey() {
    return crypto.subtle.generateKey({ name: CRYPTO_ALGORITHM, length: 128 }, false, ['encrypt', 'decrypt']);
}

async function encrypt(key, message) {
    // Reuse IV because there is no damage in knowing that two ciphertexts came from the same plaintext.
    const buffer = await crypto.subtle.encrypt(
        { name: CRYPTO_ALGORITHM, iv: new Uint8Array(12) },
        key,
        new TextEncoder().encode(message),
    );

    return buffer;
}

async function decrypt(key, message) {
    // Reuse IV because there is no damage in knowing that two ciphertexts came from the same plaintext.
    const buffer = await crypto.subtle.decrypt(
        { name: CRYPTO_ALGORITHM, iv: new Uint8Array(12) },
        key,
        message,
    );

    return new TextDecoder().decode(buffer);
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export { generateKey, encrypt, decrypt };
