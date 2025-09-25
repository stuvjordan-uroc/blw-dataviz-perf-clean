import { number } from "zod";

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
export interface ImpPerfLayout {
  breakpoint: string;
  screenWidthRange: [number, number];
  vizWidth: number;
  waveHeight: number;
  pointRadius: number;
  responseGap: number;
  partyGap: number;
  labelHeight: number;
}
export interface VizConfig {
  importance: {
    sample_size: number;
    value_groups: {
      response: string[][];
      pid3: string[][];
    };
    layouts: ImpPerfLayout[];
  };
  performance: {
    sample_size: number;
    value_groups: {
      response: string[][];
      pid3: string[][];
    };
    layouts: ImpPerfLayout[];
  };
}
