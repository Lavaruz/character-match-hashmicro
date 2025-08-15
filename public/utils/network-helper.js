const SECURE = true;
const AES_KEY = "xYDBqQ1prC5Np66DxYDBqQ1prC5Np66D"; // ideally dari env FE (environtment[Angular] / PUBLIC_ENV[Next])

// Crypto handling
function encryptFrontend(data, key = AES_KEY) {
    if (!SECURE) return data;
    if (typeof data === 'object') data = JSON.stringify(data);
    return { r: CryptoJS.AES.encrypt(data, key).toString() };
}

function decryptFrontend(data, key = AES_KEY) {
    if (!SECURE) return data;
    const bytes = CryptoJS.AES.decrypt(data.r || data, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    try {
        return JSON.parse(decrypted);
    } catch {
        return decrypted;
    }
}

// Core request handler
async function apiRequest(url, method = 'GET', body = null, headers = {}) {
    try {
        let payload = body;

        // Encrypt payload if SECURE
        if (body && SECURE) {
            payload = encryptFrontend(body);
        }

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            credentials: 'include',
            body: method === 'GET' || method === 'DELETE' ? null : JSON.stringify(payload)
        });

        let rawData;
        try {
            rawData = await res.json();
        } catch {
            throw new Error(`Invalid JSON response from server (${res.status})`);
        }

        // Decrypt response if SECURE
        let data = rawData;
        if (SECURE) {
            try {
                data = decryptFrontend(rawData);
            } catch {
                throw new Error('Failed to decrypt server response');
            }
        }

        if (!res.ok) {
            // Pastikan pesan error dibaca dari server kalau ada
            throw new Error(data?.message || data?.error || `Request failed with status ${res.status}`);
        }

        return data;
    } catch (err) {
        // Pastikan yang dilempar adalah Error dengan message jelas
        if (err instanceof Error) {
            throw err;
        } else {
            throw new Error(String(err));
        }
    }
}


// Method-specific helpers
const apiGet = (url, headers = {}) => apiRequest(url, 'GET', null, headers);
const apiPost = (url, body, headers = {}) => apiRequest(url, 'POST', body, headers);
const apiPut = (url, body, headers = {}) => apiRequest(url, 'PUT', body, headers);
const apiDelete = (url, headers = {}) => apiRequest(url, 'DELETE', null, headers);
