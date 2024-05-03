import {ModelDescription} from './types';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

export const modelDescriptions: ModelDescription[] = modelsJson;

// A value between 0 and 1 inclusive that represents a sampling rate for events sent to Amplitude/Statsig.
export const ANALYTICS_SAMPLE_RATE = 0.01;
