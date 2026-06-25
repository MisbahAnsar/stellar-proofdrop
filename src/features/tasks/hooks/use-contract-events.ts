"use client";

import { useEffect, useRef } from "react";

import { getProofdropContractId } from "@/config/stellar";
import { activityFromChainEvent } from "@/lib/dashboard/activity-from-task";
import { taskEventBus } from "@/lib/events/task-bus";
import { appendActivity } from "@/services/activity/activity-store";
import { fetchProofdropEvents } from "@/services/stellar/events";
import { applyChainEventToMetadata } from "@/services/tasks/chain-metadata";

const POLL_INTERVAL_MS = 15_000;
const LEDGER_LOOKBACK = 1_000;

export function useContractEventListener() {
  const lastLedgerRef = useRef<number | null>(null);
  const seenEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const contractId = getProofdropContractId();
    if (!contractId) {
      return;
    }

    const activeContractId = contractId;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function pollEvents() {
      try {
        const { getRpcServer } = await import("@/services/stellar/rpc");
        const server = getRpcServer();
        const latestLedger = lastLedgerRef.current
          ? lastLedgerRef.current + 1
          : Math.max(
              1,
              (await server.getLatestLedger()).sequence - LEDGER_LOOKBACK,
            );

        const events = await fetchProofdropEvents({
          contractId: activeContractId,
          startLedger: latestLedger,
        });

        if (cancelled || events.length === 0) {
          return;
        }

        let maxLedger = latestLedger;
        for (const event of events) {
          const key = `${event.type}:${event.transactionHash}:${event.taskId}`;
          if (seenEventsRef.current.has(key)) {
            continue;
          }

          seenEventsRef.current.add(key);
          maxLedger = Math.max(maxLedger, event.ledger);

          applyChainEventToMetadata(event);

          const entry = activityFromChainEvent(event);
          appendActivity(entry);
          taskEventBus.emitActivity(entry);
        }

        lastLedgerRef.current = maxLedger;
      } catch {
        // Polling failures should not break the UI.
      }
    }

    void pollEvents();
    timer = setInterval(() => {
      void pollEvents();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);
}
