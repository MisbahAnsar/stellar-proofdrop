import { describe, expect, it } from "vitest";

import {
  bufferToHex,
  bytesToHex,
  hexToBytes,
  sha256HexFromArrayBuffer,
} from "@/lib/proof/hash";

describe("sha256HexFromArrayBuffer", () => {
  it("hashes known input to expected SHA-256 hex", async () => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode("hello").buffer;

    const hash = await sha256HexFromArrayBuffer(buffer);

    expect(hash).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
});

describe("hex helpers", () => {
  it("round-trips bytes through hex", () => {
    const bytes = new Uint8Array([0, 255, 16, 171]);
    expect(bytesToHex(bytes)).toBe("00ff10ab");
    expect(bufferToHex(bytes.buffer)).toBe("00ff10ab");
    expect(hexToBytes("00ff10ab")).toEqual(bytes);
  });

  it("rejects odd-length hex strings", () => {
    expect(() => hexToBytes("abc")).toThrow("Invalid hex string");
  });
});
