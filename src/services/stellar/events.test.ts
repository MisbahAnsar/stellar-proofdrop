import { Address, xdr } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";

import { classifyProofdropEventValue } from "./events";

const CREATOR = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const WORKER = CREATOR;

function eventMap(fields: Record<string, unknown>): xdr.ScVal {
  const entries = Object.entries(fields).map(([key, value]) => {
    let val: xdr.ScVal;

    if (typeof value === "bigint") {
      val = xdr.ScVal.scvU64(xdr.Uint64.fromString(value.toString()));
    } else if (value instanceof Uint8Array) {
      val = xdr.ScVal.scvBytes(Buffer.from(value));
    } else if (typeof value === "string" && value.startsWith("G")) {
      val = Address.fromString(value).toScVal();
    } else {
      throw new Error(`Unsupported test field value for ${key}`);
    }

    return new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol(key),
      val,
    });
  });

  return xdr.ScVal.scvMap(entries);
}

describe("classifyProofdropEventValue", () => {
  it("classifies task_created events", () => {
    const value = eventMap({
      task_id: BigInt(1),
      creator: CREATOR,
      reward: BigInt(10_000_000),
    });

    expect(classifyProofdropEventValue(value)).toEqual({
      type: "task_created",
      taskId: "1",
      message: "Task #1 created on-chain",
      creator: CREATOR,
      rewardStroops: "10000000",
    });
  });

  it("classifies proof_submitted events", () => {
    const value = eventMap({
      task_id: BigInt(2),
      worker: WORKER,
      proof_hash: new Uint8Array([0xab, 0xcd]),
    });

    expect(classifyProofdropEventValue(value)).toEqual({
      type: "proof_submitted",
      taskId: "2",
      message: "Proof submitted for task #2",
      worker: WORKER,
      proofHashHex: "abcd",
    });
  });

  it("classifies task_approved before task_created shape overlap", () => {
    const value = eventMap({
      task_id: BigInt(3),
      creator: CREATOR,
      worker: WORKER,
      reward: BigInt(5_000_000),
    });

    expect(classifyProofdropEventValue(value)).toEqual({
      type: "task_approved",
      taskId: "3",
      message: "Task #3 approved on-chain",
      creator: CREATOR,
      worker: WORKER,
      rewardStroops: "5000000",
    });
  });

  it("classifies task_rejected events", () => {
    const value = eventMap({
      task_id: BigInt(4),
      creator: CREATOR,
      worker: WORKER,
    });

    expect(classifyProofdropEventValue(value)).toEqual({
      type: "task_rejected",
      taskId: "4",
      message: "Task #4 proof rejected on-chain",
      creator: CREATOR,
      worker: WORKER,
    });
  });

  it("returns null for unknown event payloads", () => {
    const value = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("unknown"),
        val: xdr.ScVal.scvBool(true),
      }),
    ]);

    expect(classifyProofdropEventValue(value)).toBeNull();
  });
});
