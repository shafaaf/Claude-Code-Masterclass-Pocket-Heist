import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockOnSuccess } = vi.hoisted(() => ({
  mockOnSuccess: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  getDocs: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
}));

// component imports
import CodenamePrompt from "@/components/CodenamePrompt";
import { getDocs, setDoc } from "firebase/firestore";

describe("CodenamePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks submission of an empty codename", async () => {
    const user = userEvent.setup();
    render(<CodenamePrompt uid="me" onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole("button", { name: /set codename/i }));

    expect(
      await screen.findByText(/codename is required/i),
    ).toBeInTheDocument();
    expect(getDocs).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("blocks a codename that's already taken", async () => {
    vi.mocked(getDocs).mockResolvedValue({ empty: false } as never);
    const user = userEvent.setup();
    render(<CodenamePrompt uid="me" onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText(/codename/i), "Falcon");
    await user.click(screen.getByRole("button", { name: /set codename/i }));

    expect(await screen.findByText(/already taken/i)).toBeInTheDocument();
    expect(setDoc).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("sets a codename and calls onSuccess when it's available", async () => {
    vi.mocked(getDocs).mockResolvedValue({ empty: true } as never);
    const user = userEvent.setup();
    render(<CodenamePrompt uid="me" onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText(/codename/i), "Falcon");
    await user.click(screen.getByRole("button", { name: /set codename/i }));

    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalledTimes(1));
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), {
      id: "me",
      codename: "Falcon",
    });
  });

  it("shows an error and does not call onSuccess when the write fails", async () => {
    vi.mocked(getDocs).mockResolvedValue({ empty: true } as never);
    vi.mocked(setDoc).mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    render(<CodenamePrompt uid="me" onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText(/codename/i), "Falcon");
    await user.click(screen.getByRole("button", { name: /set codename/i }));

    expect(
      await screen.findByText(/couldn't set your codename/i),
    ).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
