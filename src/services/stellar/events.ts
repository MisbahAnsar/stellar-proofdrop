import { scValToNative, xdr } from "@stellar/stellar-sdk";

import type { TaskCreatedChainEvent } from "@/types/task";

const TASK_CREATED_TOPICS = ["task", "created"];

function topicToString(topic: xdr.ScVal): string | null {
  switch (topic.switch()) {
    case xdr.ScValType.scvSymbol():
      return topic.sym().toString();
    default:
      return null;
  }
}

function matchesTaskCreatedTopics(topics: xdr.ScVal[]): boolean {
  if (topics.length < TASK_CREATED_TOPICS.length) {
    return false;
  }

  return TASK_CREATED_TOPICS.every((expected, index) => {
    return topicToString(topics[index]) === expected;
  });
}

function parseEventValue(value: xdr.ScVal): {
  taskId: string;
  creator: string;
  rewardStroops: string;
} | null {
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

  if (
    typeof fields.task_id !== "bigint" &&
    typeof fields.task_id !== "number"
  ) {
    return null;
  }

  if (typeof fields.creator !== "string") {
    if (
      fields.creator &&
      typeof fields.creator === "object" &&
      "toString" in fields.creator
    ) {
      fields.creator = String(fields.creator);
    } else {
      return null;
    }
  }

  if (typeof fields.creator !== "string") {
    return null;
  }

  if (typeof fields.reward !== "bigint" && typeof fields.reward !== "number") {
    return null;
  }

  return {
    taskId: fields.task_id.toString(),
    creator: fields.creator,
    rewardStroops: fields.reward.toString(),
  };
}

export function parseTaskCreatedEvents(
  events: xdr.ContractEvent[],
  transactionHash: string,
  ledger: number,
): TaskCreatedChainEvent[] {
  const parsed: TaskCreatedChainEvent[] = [];

  for (const event of events) {
    if (event.type().name !== "contract") {
      continue;
    }

    const body = event.body();
    if (body.switch() !== 0) {
      continue;
    }

    const v0 = body.v0();
    if (!matchesTaskCreatedTopics(v0.topics())) {
      continue;
    }

    const data = parseEventValue(v0.data());
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

export async function fetchTaskCreatedEvents(params: {
  contractId: string;
  startLedger: number;
  limit?: number;
}): Promise<TaskCreatedChainEvent[]> {
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
    ],
    limit: params.limit ?? 100,
  });

  return response.events
    .filter(
      (event) => event.type === "contract" && event.inSuccessfulContractCall,
    )
    .map((event) => {
      const data = parseEventValue(event.value);
      if (!data) {
        return null;
      }

      return {
        ...data,
        transactionHash: event.txHash,
        ledger: event.ledger,
      };
    })
    .filter((event): event is TaskCreatedChainEvent => event !== null);
}
