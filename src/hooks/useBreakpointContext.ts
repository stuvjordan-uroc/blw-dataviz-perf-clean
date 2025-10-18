import { useContext } from "react";
import { BreakpointContext } from "../contexts/breakpointContext";
import type { Breakpoint } from "./useBreakpoint";

export function useBreakpointContext(): Breakpoint {
  const context = useContext(BreakpointContext);
  if (context === undefined) {
    throw new Error("useBreakpointContext must be used within a BreakpointProvider");
  }
  return context;
}