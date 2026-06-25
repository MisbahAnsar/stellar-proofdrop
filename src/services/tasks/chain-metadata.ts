import { taskEventBus } from "@/lib/events/task-bus";
import type { ProofdropRpcEvent } from "@/services/stellar/events";
import { upsertTaskMetadata } from "@/services/tasks/metadata-store";

export function applyChainEventToMetadata(event: ProofdropRpcEvent) {
  const timestamp = event.timestamp;

  switch (event.type) {
    case "task_created": {
      if (!event.creator || !event.rewardStroops) {
        return;
      }

      const task = upsertTaskMetadata(event.taskId, {
        title: `Task #${event.taskId}`,
        description: "Synced from on-chain event.",
        creator: event.creator,
        rewardStroops: event.rewardStroops,
        transactionHash: event.transactionHash,
        createdAt: timestamp,
        ledger: event.ledger,
        status: "open",
      });

      if (task) {
        taskEventBus.emitTaskUpdated(task);
      }
      return;
    }

    case "proof_submitted": {
      if (!event.worker || !event.proofHashHex) {
        return;
      }

      const task = upsertTaskMetadata(event.taskId, {
        title: `Task #${event.taskId}`,
        description: "Synced from on-chain event.",
        creator: event.creator ?? "",
        rewardStroops: event.rewardStroops ?? "0",
        transactionHash: event.transactionHash,
        createdAt: timestamp,
        status: "proof_submitted",
        proofHash: event.proofHashHex,
        proofSubmittedBy: event.worker,
        proofSubmittedAt: timestamp,
        proofTransactionHash: event.transactionHash,
        ledger: event.ledger,
      });

      if (task) {
        taskEventBus.emitTaskUpdated(task);
      }
      return;
    }

    case "task_approved": {
      const task = upsertTaskMetadata(event.taskId, {
        title: `Task #${event.taskId}`,
        description: "Synced from on-chain event.",
        creator: event.creator ?? "",
        rewardStroops: event.rewardStroops ?? "0",
        transactionHash: event.transactionHash,
        createdAt: timestamp,
        status: "approved",
        reviewAction: "approved",
        reviewedAt: timestamp,
        reviewTransactionHash: event.transactionHash,
        ledger: event.ledger,
      });

      if (task) {
        taskEventBus.emitTaskUpdated(task);
      }
      return;
    }

    case "task_rejected": {
      const task = upsertTaskMetadata(event.taskId, {
        title: `Task #${event.taskId}`,
        description: "Synced from on-chain event.",
        creator: event.creator ?? "",
        rewardStroops: event.rewardStroops ?? "0",
        transactionHash: event.transactionHash,
        createdAt: timestamp,
        status: "open",
        reviewAction: "rejected",
        reviewedAt: timestamp,
        reviewTransactionHash: event.transactionHash,
        ledger: event.ledger,
        proofHash: undefined,
        proofSubmittedBy: undefined,
        proofSubmittedAt: undefined,
        proofTransactionHash: undefined,
      });

      if (task) {
        taskEventBus.emitTaskUpdated(task);
      }
    }
  }
}
