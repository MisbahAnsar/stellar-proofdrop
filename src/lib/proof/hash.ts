export async function sha256HexFromArrayBuffer(
  buffer: ArrayBuffer,
): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return bufferToHex(digest);
}

export async function sha256HexFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return sha256HexFromArrayBuffer(buffer);
}

export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
