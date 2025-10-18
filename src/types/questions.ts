export interface QuestionPrompt {
  variable_name: string;
  question_text: string;
  short_text: string;
  category: string;
}

export interface QuestionsData {
  prefix_performance: string;
  prefix_importance: string;
  prompts: QuestionPrompt[];
}

export interface GroupedPrompts {
  [category: string]: QuestionPrompt[];
}