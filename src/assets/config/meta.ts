// Auto-generated TypeScript definitions from Python Pydantic models
// Do not edit manually - regenerate using generate_typescript.py

interface SplitProportion {
  response: string[];
  proportion: number;
}

interface SplitProportions {
  expanded: SplitProportion[];
  collapsed: SplitProportion[];
}

interface Wave {
  value: [string, number[]];
  index: number;
}

interface Party {
  value: [string, string[]];
  index: number;
}

interface Split {
  wave: Wave | null;
  party: Party | null;
  responses: SplitProportions | null;
}

interface Characteristic {
  characteristic_name: string;
  col_idx: number;
  in_wave_response_groups: number[];
  splits: Split[];
}

interface ResponseGroups {
  expanded: string[][];
  collapsed: string[][];
}

interface ResponseMeta {
  vals: string[];
  response_groups: ResponseGroups;
}

interface Pid3Meta {
  col_idx: number;
  vals: string[];
  response_groups: [string, string[]][];
}

interface WaveMeta {
  col_idx: number;
  vals: number[];
  response_groups: [string, number[]][];
}

interface WeightMeta {
  col_idx: number;
}

export interface Meta {
  characteristics: Characteristic[] | null;
  response: ResponseMeta;
  pid3: Pid3Meta;
  wave: WaveMeta;
  weight: WeightMeta;
}

interface Layout {
  breakpoint: string;
  screenWidthRange: [number, number];
  vizWidth: number;
  waveHeight: number;
  labelHeight: number;
  responseGap: number;
  partyGap: number;
  pointRadius: number;
}

interface PointPosition {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

interface PointPositions {
  error: boolean;
  data: PointPosition[];
}

interface Segment {
  topLeftY: number;
  topLeftX: number;
  height: number;
  width: number;
  pointPositions: PointPosition[];
  error: boolean;
}

interface SplitProportionWithCount {
  response: string[];
  proportion: number;
  count: number;
}

interface SplitProportionWithSegment {
  response: string[];
  proportion: number;
  count: number;
  segment: Segment;
}

interface SplitProportionsWithSegments {
  expanded: SplitProportionWithSegment[];
  collapsed: SplitProportionWithSegment[];
}

export interface SplitWithSegments {
  wave: Wave | null;
  party: Party | null;
  responses: SplitProportionsWithSegments | null;
}

interface VizConfig {
  sample_size: number;
  layouts: Layout[];
}

export interface CoordinateData {
  splits: SplitWithSegments[];
  unsplitPositions: PointPositions;
  waves: number[];
}

interface CoordinateResult {
  data: CoordinateData;
  characteristic_name: string;
  layout_breakpoint: string;
}
