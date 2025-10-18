export interface Coordinates {
  splits: Split[],
  unsplitPositions: {
    error: boolean,
    data: PointPosition[]
  }
  waves: number[]
}

export interface Wave {
  value: [string, number[]],
  index: number
}

export interface Party {
  value: [string, string[]],
  index: number
}

export interface Split {
  wave: Wave | null,
  party: Party | null,
  responses: {
    expanded: ResponseGroupData[]
    collapsed: ResponseGroupData[]
  }
}

export interface ResponseGroupData {
  response: string[],
  proportion: number,
  count: number,
  segment: Segment
}

export interface Segment {
  topLeftX: number,
  topLeftY: number,
  width: number,
  height: number,
  pointPositions: PointPosition[],
  error: boolean
}

export interface PointPosition {
  x: number,
  y: number,
  cx: number,
  cy: number
}

// Type unions for split view options
export type SplitViewMode = 'all-data' | 'by-wave-and-party' | 'by-wave-only' | 'by-party-only';

// Type union for data granularity
export type DataGranularity = 'expanded' | 'collapsed';