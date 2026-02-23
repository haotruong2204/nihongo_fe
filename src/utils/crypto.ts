const RSA_PRIVATE_KEY_PEM = process.env.REACT_APP_RSA_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

interface EncryptedPayload {
  encrypted_key: string;
  iv: string;
  encrypted_data: string;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, "")
    .replace(/-----END RSA PRIVATE KEY-----/, "")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i += 1) {
    view[i] = binary.charCodeAt(i);
  }
  return buf;
}

function isEncryptedPayload(data: unknown): data is EncryptedPayload {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.encrypted_key === "string" &&
    typeof obj.iv === "string" &&
    typeof obj.encrypted_data === "string"
  );
}

async function importRsaPrivateKey(pem: string): Promise<CryptoKey> {
  const keyData = pemToArrayBuffer(pem);

  // Try PKCS#8 first, fallback to PKCS#1
  try {
    return await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      { name: "RSA-OAEP", hash: "SHA-1" },
      false,
      ["decrypt"]
    );
  } catch {
    // PKCS#1 format — need to wrap in PKCS#8
    throw new Error(
      "RSA key must be in PKCS#8 format. Convert with: openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in rsa_private.pem -out rsa_private_pkcs8.pem"
    );
  }
}

async function rsaDecrypt(
  rsaKey: CryptoKey,
  encryptedData: ArrayBuffer
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: "RSA-OAEP" }, rsaKey, encryptedData);
}

async function aesDecrypt(
  aesKeyRaw: ArrayBuffer,
  iv: ArrayBuffer,
  encryptedData: ArrayBuffer
): Promise<ArrayBuffer> {
  const aesKey = await crypto.subtle.importKey(
    "raw",
    aesKeyRaw,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, aesKey, encryptedData);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i += 1) {
    view[i] = binary.charCodeAt(i);
  }
  return buf;
}

export async function decryptResponse(json: unknown): Promise<unknown> {
  if (!RSA_PRIVATE_KEY_PEM || !isEncryptedPayload(json)) {
    return json;
  }

  const rsaKey = await importRsaPrivateKey(RSA_PRIVATE_KEY_PEM);

  const encryptedAesKey = base64ToArrayBuffer(json.encrypted_key);
  const iv = base64ToArrayBuffer(json.iv);
  const encryptedData = base64ToArrayBuffer(json.encrypted_data);

  const aesKeyRaw = await rsaDecrypt(rsaKey, encryptedAesKey);
  const decryptedBuffer = await aesDecrypt(aesKeyRaw, iv, encryptedData);

  const decoder = new TextDecoder();
  const plaintext = decoder.decode(decryptedBuffer);

  return JSON.parse(plaintext);
}
