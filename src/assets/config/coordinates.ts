// Auto-generated TypeScript definitions for coordinate models
// Do not edit manually - regenerate using generate_coordinate_typescript.py

export interface Wave {
  value: [string, number[]];
  index: number;
}

export interface Party {
  value: [string, string[]];
  index: number;
}

export interface Layout {
  breakpoint: string;
  screenWidthRange: [number, number];
  vizWidth: number;
  waveHeight: number;
  labelHeight: number;
  responseGap: number;
  partyGap: number;
  pointRadius: number;
}

export interface PointPosition {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

export interface PointPositions {
  error: boolean;
  data: PointPosition[];
}

export interface Segment {
  topLeftY: number;
  topLeftX: number;
  height: number;
  width: number;
  pointPositions: PointPosition[];
  error: boolean;
}

export interface SplitProportionWithCount {
  response: string[];
  proportion: number;
  count: number;
}

export interface SplitProportionWithSegment {
  response: string[];
  proportion: number;
  count: number;
  segment: Segment;
}

export interface SplitProportionsWithSegments {
  expanded: SplitProportionWithSegment[];
  collapsed: SplitProportionWithSegment[];
}

export interface SplitWithSegments {
  wave: Wave | null;
  party: Party | null;
  responses: SplitProportionsWithSegments | null;
}

export interface VizConfig {
  sample_size: number;
  layouts: Layout[];
}

export interface CoordinateData {
  splits: SplitWithSegments[];
  unsplitPositions: PointPositions;
  waves: number[];
}

export interface CoordinateResult {
  data: CoordinateData;
  characteristic_name: string;
  layout_breakpoint: string;
}
