
export interface Question {
  question_text: string;
  short_text: string;
  category: string;
}
export interface Questions {
  prefix_importance: string;
  prefix_performance: string;
  prompts: Question[];
}
export interface Layout {
  breakpoint: string;
  screenWidthRange: [number, number];
  vizWidth: number;
  waveHeight: number;
  pointRadius: number;
  responseGap: number;
  partyGap: number;
  labelHeight: number;
}
export interface ColorConfig {
  parties: string[];
  shades: {
    expanded: [number, string][],
    collapsed: [number, string][]
  };
  cssPrefix: string
}
export interface VizConfig {
  sample_size: number;
  layouts: Layout[];
  colorConfig: ColorConfig;
};

