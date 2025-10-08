export interface Response {
  response: string[];
  proportion: number;
}
export interface Split {
  wave: number | null;
  party: string[] | null;
  responses: {
    expanded: Response[],
    collapsed: Response[],
  } | null;
}
export interface Characteristic {
  characteristic_name: string;
  col_idx: number;
  in_waves: number[];
  splits: Split[];
}
export interface GroupVars {
  pid3: {
    col_idx: number;
    vals: string[];
    response_groups: string[][];
  };
  wave: {
    col_idx: number;
    vals: number[];
    dates: [number, string][];
  };
  weight: {
    col_idx: number;
  };
}
export interface PerfOrImp {
  characteristics: Characteristic[];
  vals: string[];
  response_groups: {
    expanded: string[][];
    collapsed: string[][];
  }
}

export type Meta = {
  response: PerfOrImp;
} & GroupVars