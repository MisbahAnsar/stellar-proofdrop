import type { StoredProof } from "@/types/proof";

const STORAGE_KEY = "proveit:proofs";

function readAll(): StoredProof[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StoredProof[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(proofs: StoredProof[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proofs));
  } catch {
    // QuotaExceededError — fail silently for demo storage.
  }
}

export function saveProof(proof: StoredProof) {
  const existing = readAll();
  writeAll([proof, ...existing.filter((item) => item.taskId !== proof.taskId)]);
}

export function deleteProof(taskId: string) {
  writeAll(readAll().filter((item) => item.taskId !== taskId));
}

export function getProof(taskId: string): StoredProof | undefined {
  return readAll().find((item) => item.taskId === taskId);
}

export function getAllProofs(): StoredProof[] {
  return readAll();
}
