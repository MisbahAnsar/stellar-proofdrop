import { scValToNative, xdr } from "@stellar/stellar-sdk";

import type { ProofSubmittedChainEvent } from "@/types/proof";
import type {
  TaskApprovedChainEvent,
  TaskCreatedChainEvent,
  TaskRejectedChainEvent,
} from "@/types/task";

const TASK_CREATED_TOPICS = ["task", "created"];
const PROOF_SUBMITTED_TOPICS = ["task", "proof_submitted"];
const TASK_APPROVED_TOPICS = ["task", "approved"];
const TASK_REJECTED_TOPICS = ["task", "rejected"];

function topicToString(topic: xdr.ScVal): string | null {
  switch (topic.switch()) {
    case xdr.ScValType.scvSymbol():
      return topic.sym().toString();
    default:
      return null;
  }
}

function matchesTopics(topics: xdr.ScVal[], expected: string[]): boolean {
  if (topics.length < expected.length) {
    return false;
  }

  return expected.every((topic, index) => {
    return topicToString(topics[index]) === topic;
  });
}

function parseMapFields(value: xdr.ScVal): Record<string, unknown> | null {
  if (value.switch() !== xdr.ScValType.scvMap()) {
    return null;
  }

  const entries = value.map() ?? [];
  const fields: Record<string, unknown> = {};

  for (const entry of entries) {
    const key = topicToString(entry.key());
    if (!key) {
      continue;
    }

    fields[key] = scValToNative(entry.val());
  }

  return fields;
}

function normalizeAddress(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }

  return null;
}

function normalizeHash(value: unknown): string | null {
  if (value instanceof Uint8Array) {
    return Array.from(value)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  if (Buffer.isBuffer(value)) {
    return value.toString("hex");
  }

  return null;
}

function parseTaskCreatedValue(value: xdr.ScVal): {
  taskId: string;
  creator: string;
  rewardStroops: string;
} | null {
  const fields = parseMapFields(value);
  if (!fields) {
    return null;
  }

  if (
    typeof fields.task_id !== "bigint" &&
    typeof fields.task_id !== "number"
  ) {
    return null;
  }

  const creator = normalizeAddress(fields.creator);
  if (!creator) {
    return null;
  }

  if (typeof fields.reward !== "bigint" && typeof fields.reward !== "number") {
    return null;
  }

  return {
    taskId: fields.task_id.toString(),
    creator,
    rewardStroops: fields.reward.toString(),
  };
}

function parseProofSubmittedValue(value: xdr.ScVal): {
  taskId: string;
  worker: string;
  proofHashHex: string;
} | null {
  const fields = parseMapFields(value);
  if (!fields) {
    return null;
  }

  if (
    typeof fields.task_id !== "bigint" &&
    typeof fields.task_id !== "number"
  ) {
    return null;
  }

  const worker = normalizeAddress(fields.worker);
  const proofHashHex = normalizeHash(fields.proof_hash);
  if (!worker || !proofHashHex) {
    return null;
  }

  return {
    taskId: fields.task_id.toString(),
    worker,
    proofHashHex,
  };
}

function parseTaskApprovedValue(value: xdr.ScVal): {
  taskId: string;
  creator: string;
  worker: string;
  rewardStroops: string;
} | null {
  const fields = parseMapFields(value);
  if (!fields) {
    return null;
  }

  if (
    typeof fields.task_id !== "bigint" &&
    typeof fields.task_id !== "number"
  ) {
    return null;
  }

  const creator = normalizeAddress(fields.creator);
  const worker = normalizeAddress(fields.worker);
  if (!creator || !worker) {
    return null;
  }

  if (typeof fields.reward !== "bigint" && typeof fields.reward !== "number") {
    return null;
  }

  return {
    taskId: fields.task_id.toString(),
    creator,
    worker,
    rewardStroops: fields.reward.toString(),
  };
}

function parseTaskRejectedValue(value: xdr.ScVal): {
  taskId: string;
  creator: string;
  worker: string;
} | null {
  const fields = parseMapFields(value);
  if (!fields) {
    return null;
  }

  if (
    typeof fields.task_id !== "bigint" &&
    typeof fields.task_id !== "number"
  ) {
    return null;
  }

  const creator = normalizeAddress(fields.creator);
  const worker = normalizeAddress(fields.worker);
  if (!creator || !worker) {
    return null;
  }

  return {
    taskId: fields.task_id.toString(),
    creator,
    worker,
  };
}

function parseContractEvents<TBase>(
  events: xdr.ContractEvent[],
  topics: string[],
  parser: (value: xdr.ScVal) => TBase | null,
  transactionHash: string,
  ledger: number,
): Array<TBase & { transactionHash: string; ledger: number }> {
  const parsed: Array<TBase & { transactionHash: string; ledger: number }> = [];

  for (const event of events) {
    if (event.type().name !== "contract") {
      continue;
    }

    const body = event.body();
    if (body.switch() !== 0) {
      continue;
    }

    const v0 = body.v0();
    if (!matchesTopics(v0.topics(), topics)) {
      continue;
    }

    const data = parser(v0.data());
    if (!data) {
      continue;
    }

    parsed.push({
      ...data,
      transactionHash,
      ledger,
    });
  }

  return parsed;
}

export function parseTaskCreatedEvents(
  events: xdr.ContractEvent[],
  transactionHash: string,
  ledger: number,
): TaskCreatedChainEvent[] {
  return parseContractEvents(
    events,
    TASK_CREATED_TOPICS,
    parseTaskCreatedValue,
    transactionHash,
    ledger,
  );
}

export function parseProofSubmittedEvents(
  events: xdr.ContractEvent[],
  transactionHash: string,
  ledger: number,
): ProofSubmittedChainEvent[] {
  return parseContractEvents(
    events,
    PROOF_SUBMITTED_TOPICS,
    parseProofSubmittedValue,
    transactionHash,
    ledger,
  );
}

export function parseTaskApprovedEvents(
  events: xdr.ContractEvent[],
  transactionHash: string,
  ledger: number,
): TaskApprovedChainEvent[] {
  return parseContractEvents(
    events,
    TASK_APPROVED_TOPICS,
    parseTaskApprovedValue,
    transactionHash,
    ledger,
  );
}

export function parseTaskRejectedEvents(
  events: xdr.ContractEvent[],
  transactionHash: string,
  ledger: number,
): TaskRejectedChainEvent[] {
  return parseContractEvents(
    events,
    TASK_REJECTED_TOPICS,
    parseTaskRejectedValue,
    transactionHash,
    ledger,
  );
}

export type ProofdropRpcEvent = {
  type: "task_created" | "proof_submitted" | "task_approved" | "task_rejected";
  taskId: string;
  transactionHash: string;
  ledger: number;
  message: string;
  timestamp: string;
  creator?: string;
  worker?: string;
  rewardStroops?: string;
  proofHashHex?: string;
};

/** Classify RPC event data. Order matters — specific parsers before generic ones. */
export function classifyProofdropEventValue(
  value: xdr.ScVal,
): Omit<ProofdropRpcEvent, "transactionHash" | "ledger" | "timestamp"> | null {
  const proof = parseProofSubmittedValue(value);
  if (proof) {
    return {
      type: "proof_submitted",
      taskId: proof.taskId,
      message: `Proof submitted for task #${proof.taskId}`,
      worker: proof.worker,
      proofHashHex: proof.proofHashHex,
    };
  }

  const approved = parseTaskApprovedValue(value);
  if (approved) {
    return {
      type: "task_approved",
      taskId: approved.taskId,
      message: `Task #${approved.taskId} approved on-chain`,
      creator: approved.creator,
      worker: approved.worker,
      rewardStroops: approved.rewardStroops,
    };
  }

  const rejected = parseTaskRejectedValue(value);
  if (rejected) {
    return {
      type: "task_rejected",
      taskId: rejected.taskId,
      message: `Task #${rejected.taskId} proof rejected on-chain`,
      creator: rejected.creator,
      worker: rejected.worker,
    };
  }

  const created = parseTaskCreatedValue(value);
  if (created) {
    return {
      type: "task_created",
      taskId: created.taskId,
      message: `Task #${created.taskId} created on-chain`,
      creator: created.creator,
      rewardStroops: created.rewardStroops,
    };
  }

  return null;
}

export async function fetchProofdropEvents(params: {
  contractId: string;
  startLedger: number;
  limit?: number;
}): Promise<ProofdropRpcEvent[]> {
  const { getRpcServer } = await import("@/services/stellar/rpc");
  const server = getRpcServer();

  const response = await server.getEvents({
    startLedger: params.startLedger,
    filters: [
      {
        type: "contract",
        contractIds: [params.contractId],
        topics: [TASK_CREATED_TOPICS],
      },
      {
        type: "contract",
        contractIds: [params.contractId],
        topics: [PROOF_SUBMITTED_TOPICS],
      },
      {
        type: "contract",
        contractIds: [params.contractId],
        topics: [TASK_APPROVED_TOPICS],
      },
      {
        type: "contract",
        contractIds: [params.contractId],
        topics: [TASK_REJECTED_TOPICS],
      },
    ],
    limit: params.limit ?? 200,
  });

  const parsed: ProofdropRpcEvent[] = [];

  for (const event of response.events) {
    if (event.type !== "contract" || !event.inSuccessfulContractCall) {
      continue;
    }

    const classified = classifyProofdropEventValue(event.value);
    if (!classified) {
      continue;
    }

    parsed.push({
      ...classified,
      transactionHash: event.txHash,
      ledger: event.ledger,
      timestamp: new Date().toISOString(),
    });
  }

  return parsed;
}
