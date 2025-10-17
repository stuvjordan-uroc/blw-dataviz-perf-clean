import { useState, useEffect } from "react";
import vizConfig from "../assets/config/viz-config.json";

type Breakpoint = (typeof vizConfig.layouts)[number]["breakpoint"];

export const useBreakpoint = (): Breakpoint => {
  const [current_breakpoint, setCurrent_breakpoint] =
    useState<Breakpoint>("small");

  // Function to determine breakpoint based on window width
  const getBreakpointForWidth = (width: number): Breakpoint => {
    for (const layout of vizConfig.layouts) {
      const [min, max] = layout.screenWidthRange;
      if (width >= min && width <= max) {
        return layout.breakpoint;
      }
    }
    // Default fallback to small if no match found
    return "small";
  };

  useEffect(() => {
    // Update breakpoint based on window width
    const updateBreakpoint = () => {
      const newBreakpoint = getBreakpointForWidth(window.innerWidth);
      if (newBreakpoint !== current_breakpoint) {
        setCurrent_breakpoint(newBreakpoint);
      }
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Add resize event listener
    window.addEventListener("resize", updateBreakpoint);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", updateBreakpoint);
    };
  }, [current_breakpoint]); // Include current_breakpoint in dependency array

  return current_breakpoint;
};

export type { Breakpoint };