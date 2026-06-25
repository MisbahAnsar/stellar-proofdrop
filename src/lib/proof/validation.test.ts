import { describe, expect, it } from "vitest";

import {
  PROOF_MAX_BYTES,
  isAllowedProofMimeType,
  validateProofFile,
} from "@/lib/proof/validation";

function createFile(
  name: string,
  type: string,
  size: number,
): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

describe("isAllowedProofMimeType", () => {
  it("accepts supported MIME types", () => {
    expect(isAllowedProofMimeType("image/png")).toBe(true);
    expect(isAllowedProofMimeType("application/pdf")).toBe(true);
  });

  it("rejects unsupported MIME types", () => {
    expect(isAllowedProofMimeType("application/zip")).toBe(false);
  });
});

describe("validateProofFile", () => {
  it("returns null for a valid file", () => {
    const file = createFile("proof.png", "image/png", 1024);
    expect(validateProofFile(file)).toBeNull();
  });

  it("rejects unsupported file types", () => {
    const file = createFile("archive.zip", "application/zip", 100);
    expect(validateProofFile(file)).toMatch(/not supported/i);
  });

  it("rejects empty files", () => {
    const file = createFile("empty.txt", "text/plain", 0);
    expect(validateProofFile(file)).toMatch(/empty/i);
  });

  it("rejects files larger than the limit", () => {
    const file = createFile("large.pdf", "application/pdf", PROOF_MAX_BYTES + 1);
    expect(validateProofFile(file)).toMatch(/5 MB/i);
  });
});
