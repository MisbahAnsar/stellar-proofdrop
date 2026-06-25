import { afterEach, describe, expect, it } from "vitest";

import {
  getAllProofs,
  getProof,
  saveProof,
} from "@/services/proofs/proof-store";
import type { StoredProof } from "@/types/proof";

const STORAGE_KEY = "proveit:proofs";

const sampleProof = (taskId: string): StoredProof => ({
  taskId,
  fileName: "proof.png",
  mimeType: "image/png",
  size: 1024,
  dataUrl: "data:image/png;base64,abc",
  sha256: "abc123",
  submittedBy: "GWORKER",
  submittedAt: "2026-01-01T00:00:00.000Z",
});

afterEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

describe("proof-store", () => {
  it("saves and retrieves a proof by task id", () => {
    const proof = sampleProof("1");
    saveProof(proof);

    expect(getProof("1")).toEqual(proof);
    expect(getAllProofs()).toHaveLength(1);
  });

  it("replaces an existing proof for the same task", () => {
    saveProof(sampleProof("1"));
    const updated = {
      ...sampleProof("1"),
      sha256: "updated-hash",
      fileName: "new.pdf",
    };
    saveProof(updated);

    expect(getProof("1")).toEqual(updated);
    expect(getAllProofs()).toHaveLength(1);
  });

  it("returns undefined for unknown task ids", () => {
    expect(getProof("missing")).toBeUndefined();
  });
});
