export const ENDPOINT_VARIANT = 'AllTraffic';
export const REGION = 'us-east-1';
export const SNS_TOPIC =
  'arn:aws:sns:us-east-1:475661607190:javabuilder-low-urgency'; // This will be updated to a team-based SNS topic.

export const commonGraphProps = {
  width: 6,
  height: 6,
  type: 'metric',
} as const;

export const LATENCY_GAUGE_MAX_SECONDS = 30;

export const MODEL_COLORS: {[id: string]: string} = {
  'gen-ai-mistral-7b-inst-v01': '#ff7f0e',
  'gen-ai-biomistral-7b': '#2ca02c',
  'gen-ai-arithmo2-mistral-7b': '#17becf',
  'gen-ai-mistral-pirate-7b': '#1f77b4',
  'gen-ai-karen-creative-mistral-7b': '#9467bd',
};

export const BROWSER_COLORS: {[id: string]: string} = {
  Chrome: '#2ca02c',
  Firefox: '#ff7f0e',
  Safari: '#1f77b4',
};

export const STATUS_COLORS: {[id: string]: string} = {
  FAILURE: '#d62728',
  USER_PROFANITY: '#ff7f0e',
  MODEL_PROFANITY: '#9467bd',
  USER_INPUT_TOO_LARGE: '#e377c2',
};

export const COUNT_COLOR = '#2ca02c';
export const ERROR_COLOR = '#d62728';
export const WARNING_COLOR = '#ff7f0e';

export const DASHBOARD_NAME = 'GenAICurriculum';
