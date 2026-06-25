export const PROOF_MAX_BYTES = 5 * 1024 * 1024;

export const PROOF_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
] as const;

export type ProofMimeType = (typeof PROOF_ALLOWED_MIME_TYPES)[number];

export function isAllowedProofMimeType(
  mimeType: string,
): mimeType is ProofMimeType {
  return (PROOF_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function validateProofFile(file: File): string | null {
  if (!isAllowedProofMimeType(file.type)) {
    return "File type not supported. Upload JPEG, PNG, WebP, PDF, or plain text.";
  }

  if (file.size <= 0) {
    return "File is empty.";
  }

  if (file.size > PROOF_MAX_BYTES) {
    return "File must be 5 MB or smaller.";
  }

  return null;
}
