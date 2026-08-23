import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// component imports
import HeistCard from "@/components/HeistCard";
import type { Heist } from "@/types/firestore";

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h1",
    title: "Steal the stapler",
    description: "Classic Office Space move.",
    createdBy: "me",
    createdByCodename: "Raven",
    assignedTo: "other-uid",
    assignedToCodename: "Falcon",
    createdAt: new Date("2026-01-01"),
    deadline: new Date("2026-01-03"),
    finalStatus: null,
    ...overrides,
  };
}

describe("HeistCard", () => {
  it("renders the title, description, and assignee", () => {
    render(<HeistCard heist={makeHeist()} />);

    expect(screen.getByText("Steal the stapler")).toBeInTheDocument();
    expect(screen.getByText("Classic Office Space move.")).toBeInTheDocument();
    expect(screen.getByText("Falcon")).toBeInTheDocument();
  });

  it("shows Active when finalStatus is null", () => {
    render(<HeistCard heist={makeHeist({ finalStatus: null })} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows Success when finalStatus is success", () => {
    render(<HeistCard heist={makeHeist({ finalStatus: "success" })} />);
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("shows Failure when finalStatus is failure", () => {
    render(<HeistCard heist={makeHeist({ finalStatus: "failure" })} />);
    expect(screen.getByText("Failure")).toBeInTheDocument();
  });
});
