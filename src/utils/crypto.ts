export const validatePassword = (password: string): boolean => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

const getPasswordKey = async (password: string) => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  return await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
};

const deriveKey = async (passwordKey: CryptoKey, salt: Uint8Array) => {
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (
  dataBuffer: ArrayBuffer,
  password: string
): Promise<ArrayBuffer> => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const passwordKey = await getPasswordKey(password);
  const aesKey = await deriveKey(passwordKey, salt);
  
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    dataBuffer
  );
  
  // Package: Salt (16 bytes) + IV (12 bytes) + Ciphertext
  const packageBuffer = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  packageBuffer.set(salt, 0);
  packageBuffer.set(iv, salt.length);
  packageBuffer.set(new Uint8Array(encryptedContent), salt.length + iv.length);
  
  return packageBuffer.buffer;
};

export const decryptData = async (
  packageBuffer: ArrayBuffer,
  password: string
): Promise<ArrayBuffer> => {
  const packageArray = new Uint8Array(packageBuffer);
  
  if (packageArray.length < 28) { // 16 (salt) + 12 (iv)
    throw new Error("Invalid or corrupted file");
  }

  const salt = packageArray.slice(0, 16);
  const iv = packageArray.slice(16, 28);
  const ciphertext = packageArray.slice(28);
  
  const passwordKey = await getPasswordKey(password);
  const aesKey = await deriveKey(passwordKey, salt);
  
  try {
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      ciphertext
    );
    return decryptedContent;
  } catch (error) {
    throw new Error("Incorrect password or corrupted file");
  }
};
