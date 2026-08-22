import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// component imports
import AuthForm from "@/components/AuthForm";

describe("AuthForm", () => {
  it("renders login mode by default", () => {
    render(<AuthForm />);
    expect(
      screen.getByRole("heading", { name: /log in to your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("renders signup mode when initialMode is signup", () => {
    render(<AuthForm initialMode="signup" />);
    expect(
      screen.getByRole("heading", { name: /create an account/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("updates email and password fields as the user types", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "jane@example.com");
    await user.type(passwordInput, "hunter2");

    expect(emailInput).toHaveValue("jane@example.com");
    expect(passwordInput).toHaveValue("hunter2");
  });

  it("toggles password visibility, including with rapid repeated clicks", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput).toHaveAttribute("type", "text");

    // rapid repeated clicks
    await user.click(screen.getByRole("button", { name: /hide password/i }));
    await user.click(screen.getByRole("button", { name: /show password/i }));
    await user.click(screen.getByRole("button", { name: /hide password/i }));

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: /hide password/i }),
    ).toBeInTheDocument();
  });

  it("preserves typed values when switching modes", async () => {
    const user = userEvent.setup();
    render(<AuthForm initialMode="login" />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "hunter2");

    await user.click(
      screen.getByRole("button", { name: /switch to sign up mode/i }),
    );

    expect(
      screen.getByRole("heading", { name: /create an account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveValue("jane@example.com");
    expect(screen.getByLabelText(/password/i)).toHaveValue("hunter2");
  });

  describe("submission logging", () => {
    let logSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
    });

    it("logs email, password, mode, and a valid timestamp on login submit", async () => {
      const user = userEvent.setup();
      render(<AuthForm initialMode="login" />);

      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.type(screen.getByLabelText(/password/i), "hunter2");
      await user.click(screen.getByRole("button", { name: "Log in" }));

      expect(logSpy).toHaveBeenCalledTimes(1);
      const [, payload] = logSpy.mock.calls[0];
      expect(payload).toMatchObject({
        mode: "login",
        email: "jane@example.com",
        password: "hunter2",
      });
      expect(new Date(payload.timestamp).toString()).not.toBe("Invalid Date");
    });

    it("logs mode signup after switching modes and submitting", async () => {
      const user = userEvent.setup();
      render(<AuthForm initialMode="login" />);

      await user.click(
        screen.getByRole("button", { name: /switch to sign up mode/i }),
      );
      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.type(screen.getByLabelText(/password/i), "hunter2");
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      expect(logSpy).toHaveBeenCalledTimes(1);
      const [, payload] = logSpy.mock.calls[0];
      expect(payload).toMatchObject({
        mode: "signup",
        email: "jane@example.com",
        password: "hunter2",
      });
    });

    it("submits and logs even with empty fields, unblocked by validation", async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      await user.click(screen.getByRole("button", { name: "Log in" }));

      expect(logSpy).toHaveBeenCalledTimes(1);
      const [, payload] = logSpy.mock.calls[0];
      expect(payload).toMatchObject({
        mode: "login",
        email: "",
        password: "",
      });
    });
  });
});
