import type { TaskCreatedChainEvent, TaskMetadata } from "@/types/task";

export const TASK_EVENTS = {
  created: "proveit:task-created",
  refresh: "proveit:tasks-refresh",
  chainEvent: "proveit:chain-event",
} as const;

type TaskCreatedDetail = {
  task: TaskMetadata;
};

type ChainEventDetail = {
  event: TaskCreatedChainEvent;
};

class TaskEventBus extends EventTarget {
  emitTaskCreated(task: TaskMetadata) {
    this.dispatchEvent(
      new CustomEvent<TaskCreatedDetail>(TASK_EVENTS.created, {
        detail: { task },
      }),
    );
    this.emitRefresh();
  }

  emitChainEvent(event: TaskCreatedChainEvent) {
    this.dispatchEvent(
      new CustomEvent<ChainEventDetail>(TASK_EVENTS.chainEvent, {
        detail: { event },
      }),
    );
    this.emitRefresh();
  }

  emitRefresh() {
    this.dispatchEvent(new Event(TASK_EVENTS.refresh));
  }

  onTaskCreated(handler: (task: TaskMetadata) => void) {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<TaskCreatedDetail>).detail;
      handler(detail.task);
    };

    this.addEventListener(TASK_EVENTS.created, listener);
    return () => this.removeEventListener(TASK_EVENTS.created, listener);
  }

  onRefresh(handler: () => void) {
    this.addEventListener(TASK_EVENTS.refresh, handler);
    return () => this.removeEventListener(TASK_EVENTS.refresh, handler);
  }

  onChainEvent(handler: (event: TaskCreatedChainEvent) => void) {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<ChainEventDetail>).detail;
      handler(detail.event);
    };

    this.addEventListener(TASK_EVENTS.chainEvent, listener);
    return () => this.removeEventListener(TASK_EVENTS.chainEvent, listener);
  }
}

export const taskEventBus = new TaskEventBus();
