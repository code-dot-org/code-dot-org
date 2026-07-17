import {LevelProperties} from '../lab2/types';

// The elements are literal SurveyJS Model JSON — Quiz assembles them
// server-side (Quiz#summarize_for_lab2_properties), so the frontend treats
// them as opaque data handed straight to `new Survey.Model(...)`.
export interface SurveyJson {
  pages: {elements: Record<string, unknown>[]}[];
}

export interface QuizLevelProperties extends LevelProperties {
  surveyJson?: SurveyJson;
  scriptId?: number;
}
