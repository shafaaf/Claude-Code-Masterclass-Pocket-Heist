import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPush, mockRouter } = vi.hoisted(() => {
  const mockPush = vi.fn();
  return { mockPush, mockRouter: { push: mockPush } };
});

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
  default: {},
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (
    _auth: unknown,
    callback: (user: { uid: string } | null) => void,
  ) => {
    callback({ uid: "me" });
    return () => {};
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({ withConverter: vi.fn().mockReturnThis() })),
  getDocs: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: "new-heist-id" })),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
}));

// component imports
import HeistForm from "@/components/HeistForm";
import { getDocs, addDoc } from "firebase/firestore";

const USERS = [
  { id: "me", codename: "Raven" },
  { id: "other-uid", codename: "Falcon" },
];

function mockRoster(users: { id: string; codename: string }[]) {
  vi.mocked(getDocs).mockResolvedValue({
    docs: users.map((u) => ({ data: () => u })),
  } as never);
}

describe("HeistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a blocked message when the signed-in user has no codename on record", async () => {
    mockRoster([{ id: "other-uid", codename: "Falcon" }]);
    render(<HeistForm />);

    expect(
      await screen.findByText(/need a codename on file/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });

  it("renders the form and excludes the current user from the assignee list", async () => {
    mockRoster(USERS);
    render(<HeistForm />);

    await screen.findByLabelText(/title/i);
    expect(screen.getByRole("option", { name: "Falcon" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Raven" }),
    ).not.toBeInTheDocument();
  });

  it("blocks submission with inline errors when required fields are missing", async () => {
    mockRoster(USERS);
    const user = userEvent.setup();
    render(<HeistForm />);

    await screen.findByLabelText(/title/i);
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/pick someone to assign/i)).toBeInTheDocument();
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("creates a heist with the correct shape and redirects on success", async () => {
    mockRoster(USERS);
    const user = userEvent.setup();
    render(<HeistForm />);

    await screen.findByLabelText(/title/i);
    await user.type(screen.getByLabelText(/title/i), "Steal the stapler");
    await user.type(
      screen.getByLabelText(/description/i),
      "Classic Office Space move.",
    );
    await user.selectOptions(screen.getByLabelText(/assign to/i), "Falcon");
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));

    const [, heistInput] = vi.mocked(addDoc).mock.calls[0];
    expect(heistInput).toMatchObject({
      title: "Steal the stapler",
      description: "Classic Office Space move.",
      createdBy: "me",
      createdByCodename: "Raven",
      assignedTo: "other-uid",
      assignedToCodename: "Falcon",
      createdAt: "SERVER_TIMESTAMP",
      finalStatus: null,
    });
    expect((heistInput as { deadline: Date }).deadline).toBeInstanceOf(Date);

    expect(mockPush).toHaveBeenCalledWith("/heists");
  });

  it("shows an error and does not redirect when the write fails", async () => {
    mockRoster(USERS);
    vi.mocked(addDoc).mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    render(<HeistForm />);

    await screen.findByLabelText(/title/i);
    await user.type(screen.getByLabelText(/title/i), "Steal the stapler");
    await user.type(screen.getByLabelText(/description/i), "Description.");
    await user.selectOptions(screen.getByLabelText(/assign to/i), "Falcon");
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    expect(
      await screen.findByText(/couldn't create the heist/i),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("cancels back to /heists without creating a heist", async () => {
    mockRoster(USERS);
    const user = userEvent.setup();
    render(<HeistForm />);

    await screen.findByLabelText(/title/i);
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith("/heists");
    expect(addDoc).not.toHaveBeenCalled();
  });
});
