import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({})),
  getDocs: vi.fn(),
}));

// component imports
import HeistList from "@/components/HeistList";
import { getDocs } from "firebase/firestore";

function rawHeist(overrides: Record<string, unknown> = {}) {
  return {
    title: "Steal the stapler",
    description: "Classic Office Space move.",
    createdBy: "me",
    createdByCodename: "Raven",
    assignedTo: "other-uid",
    assignedToCodename: "Falcon",
    createdAt: { toDate: () => new Date("2026-01-01") },
    deadline: { toDate: () => new Date("2026-01-03") },
    finalStatus: null,
    ...overrides,
  };
}

function mockSnapshot(docs: { id: string; data: Record<string, unknown> }[]) {
  vi.mocked(getDocs).mockResolvedValue({
    docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
  } as never);
}

describe("HeistList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty-state message when there are no heists", async () => {
    mockSnapshot([]);
    render(<HeistList />);

    expect(await screen.findByText(/no heists yet/i)).toBeInTheDocument();
  });

  it("shows an error message when the fetch fails", async () => {
    vi.mocked(getDocs).mockRejectedValue(new Error("offline"));
    render(<HeistList />);

    expect(
      await screen.findByText(/couldn't load heists/i),
    ).toBeInTheDocument();
  });

  it("renders a card per heist, newest first", async () => {
    mockSnapshot([
      {
        id: "old",
        data: rawHeist({
          title: "Older heist",
          createdAt: { toDate: () => new Date("2026-01-01") },
        }),
      },
      {
        id: "new",
        data: rawHeist({
          title: "Newer heist",
          createdAt: { toDate: () => new Date("2026-01-05") },
        }),
      },
    ]);
    render(<HeistList />);

    await screen.findByText("Newer heist");
    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles.map((t) => t.textContent)).toEqual([
      "Newer heist",
      "Older heist",
    ]);
  });
});
