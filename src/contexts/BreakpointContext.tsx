import type { ReactElement, ReactNode } from "react";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { BreakpointContext } from "./breakpointContext";

// Provider component
export function BreakpointProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const breakpoint = useBreakpoint();

  return (
    <BreakpointContext.Provider value={breakpoint}>
      {children}
    </BreakpointContext.Provider>
  );
}
