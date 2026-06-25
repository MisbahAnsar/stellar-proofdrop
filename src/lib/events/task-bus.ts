import type { ActivityEntry } from "@/types/activity";
import type { TaskCreatedChainEvent, TaskMetadata } from "@/types/task";

export const TASK_EVENTS = {
  created: "proveit:task-created",
  updated: "proveit:task-updated",
  refresh: "proveit:tasks-refresh",
  chainEvent: "proveit:chain-event",
  activity: "proveit:activity",
} as const;

type TaskCreatedDetail = {
  task: TaskMetadata;
};

type TaskUpdatedDetail = {
  task: TaskMetadata;
};

type ChainEventDetail = {
  event: TaskCreatedChainEvent;
};

type ActivityDetail = {
  entry: ActivityEntry;
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

  emitTaskUpdated(task: TaskMetadata) {
    this.dispatchEvent(
      new CustomEvent<TaskUpdatedDetail>(TASK_EVENTS.updated, {
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

  emitActivity(entry: ActivityEntry) {
    this.dispatchEvent(
      new CustomEvent<ActivityDetail>(TASK_EVENTS.activity, {
        detail: { entry },
      }),
    );
    this.emitRefresh();
  }

  onTaskCreated(handler: (task: TaskMetadata) => void) {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<TaskCreatedDetail>).detail;
      handler(detail.task);
    };

    this.addEventListener(TASK_EVENTS.created, listener);
    return () => this.removeEventListener(TASK_EVENTS.created, listener);
  }

  onTaskUpdated(handler: (task: TaskMetadata) => void) {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<TaskUpdatedDetail>).detail;
      handler(detail.task);
    };

    this.addEventListener(TASK_EVENTS.updated, listener);
    return () => this.removeEventListener(TASK_EVENTS.updated, listener);
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

  onActivity(handler: (entry: ActivityEntry) => void) {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<ActivityDetail>).detail;
      handler(detail.entry);
    };

    this.addEventListener(TASK_EVENTS.activity, listener);
    return () => this.removeEventListener(TASK_EVENTS.activity, listener);
  }
}

export const taskEventBus = new TaskEventBus();
