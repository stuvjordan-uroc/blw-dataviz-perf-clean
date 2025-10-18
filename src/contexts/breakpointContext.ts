import { createContext } from "react";
import type { Breakpoint } from "../hooks/useBreakpoint";

export const BreakpointContext = createContext<Breakpoint | undefined>(undefined);