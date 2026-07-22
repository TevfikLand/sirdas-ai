import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CrisisAlert } from "./CrisisAlert";

describe("CrisisAlert", () => {
  it("shows verified help routes and requires acknowledgement", () => {
    const close = vi.fn(); render(<CrisisAlert onClose={close} />);
    expect(screen.getByText("112")).toBeInTheDocument();
    expect(screen.getByText("ALO 183")).toBeInTheDocument();
    expect(screen.queryByText(/182/)).not.toBeInTheDocument();
    const button = screen.getByRole("button", { name: /bilgilendirmeyi kapat/i });
    expect(button).toBeDisabled(); fireEvent.click(screen.getByRole("checkbox")); fireEvent.click(button);
    expect(close).toHaveBeenCalledOnce();
  });
});
