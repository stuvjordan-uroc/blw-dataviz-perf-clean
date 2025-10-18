import type { ReactElement, ReactNode } from "react";
import { BreakpointContext } from "./breakpointContext.ts";
import type { Breakpoint } from "../hooks/useBreakpoint";

// Provider component
export function BreakpointProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: Breakpoint;
}): ReactElement {
  return (
    <BreakpointContext.Provider value={value}>
      {children}
    </BreakpointContext.Provider>
  );
}
