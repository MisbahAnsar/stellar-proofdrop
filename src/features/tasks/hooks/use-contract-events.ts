"use client";

import { useEffect, useRef } from "react";

import { getProveItContractId } from "@/config/stellar";
import { taskEventBus } from "@/lib/events/task-bus";
import { fetchTaskCreatedEvents } from "@/services/stellar/events";
import { getRpcServer } from "@/services/stellar/rpc";

const POLL_INTERVAL_MS = 15_000;
const LEDGER_LOOKBACK = 1_000;

export function useContractEventListener() {
  const lastLedgerRef = useRef<number | null>(null);
  const seenEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const contractId = getProveItContractId();
    if (!contractId) {
      return;
    }

    const activeContractId = contractId;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function pollEvents() {
      try {
        const server = getRpcServer();
        const latestLedger = lastLedgerRef.current
          ? lastLedgerRef.current + 1
          : Math.max(
              1,
              (await server.getLatestLedger()).sequence - LEDGER_LOOKBACK,
            );

        const events = await fetchTaskCreatedEvents({
          contractId: activeContractId,
          startLedger: latestLedger,
        });

        if (cancelled || events.length === 0) {
          return;
        }

        let maxLedger = latestLedger;
        for (const event of events) {
          const key = `${event.transactionHash}:${event.taskId}`;
          if (seenEventsRef.current.has(key)) {
            continue;
          }

          seenEventsRef.current.add(key);
          maxLedger = Math.max(maxLedger, event.ledger);
          taskEventBus.emitChainEvent(event);
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
