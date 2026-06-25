import { describe, expect, it } from "vitest";

import {
  getStellarExpertContractUrl,
  getStellarExpertTxUrl,
  shortenHash,
} from "./explorer";

describe("stellar explorer urls", () => {
  it("builds testnet transaction urls", () => {
    const hash =
      "69a9004e21e80cbdc77bd8e5e15c1e48f61cc5cf76173c5794549ce49704777f";

    expect(getStellarExpertTxUrl(hash)).toBe(
      `https://stellar.expert/explorer/testnet/tx/${hash}`,
    );
  });

  it("builds testnet contract urls", () => {
    const contractId =
      "CAPVLSAV2KGCGYXGJOGRR5XXBL6BDOV5WOOM64NLNDHUNKHWUIBQEBLC";

    expect(getStellarExpertContractUrl(contractId)).toBe(
      `https://stellar.expert/explorer/testnet/contract/${contractId}`,
    );
  });

  it("shortens long hashes", () => {
    expect(
      shortenHash(
        "f9e7a7a5c9bf396da535a5df329e43168110da5a3292f04cad5a4cf8114fc7cf",
      ),
    ).toBe("f9e7a7a5…114fc7cf");
  });
});
