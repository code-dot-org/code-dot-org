import {AnalyticsProperties} from './analytics';

export interface ChatButton {
  label: string;
  value: string;
  analyticsProperties?: AnalyticsProperties;
}
