export interface DataManifest {
  characteristics: Record<string, {
    imp: string[];   // Available breakpoint files (without .gz extension)
    perf: string[];  // Available breakpoint files (without .gz extension)
  }>;
}