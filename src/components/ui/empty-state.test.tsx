import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No tasks"
        description="Create a task to get started."
      />,
    );

    expect(screen.getByText("No tasks")).toBeTruthy();
    expect(screen.getByText("Create a task to get started.")).toBeTruthy();
  });

  it("renders optional action content", () => {
    render(
      <EmptyState
        title="Empty"
        description="Nothing here."
        action={<button type="button">Create</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
  });
});
