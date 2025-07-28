import {SegmentedButtonsProps} from '@code-dot-org/component-library/segmentedButtons';

export interface Tab {
  label: string;
  path?: string;
}

export interface Option {
  text: string;
  value: string;
}

export interface WorkshopTabsProps {
  tabList: Tab[];
}

export interface SurveyTypeSelectionProps {
  surveyTypeOptions: Option[];
}

export interface SurveyCategorySelectionProps {
  questionCategoryButtons: SegmentedButtonsProps['buttons'];
}

export type WorkshopLayoutProps = WorkshopTabsProps &
  SurveyTypeSelectionProps &
  SurveyCategorySelectionProps;
