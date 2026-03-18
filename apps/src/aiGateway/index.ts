import {
  generateText as generateTextThroughProxy,
  experimental_transcribe as transcribeThroughProxy,
} from 'ai';

import {generateText as generateTextThroughGateway} from '@cdo/apps/aiGateway/aiSdkCompatibleGateway';

import {isAiGatewayEnabled} from './isAiGatewayEnabled';
import transcribeThroughGateway from './transcribeThroughGateway';

const generateText = isAiGatewayEnabled
  ? generateTextThroughGateway
  : generateTextThroughProxy;

const transcribe = isAiGatewayEnabled
  ? transcribeThroughGateway
  : transcribeThroughProxy;

export {generateText, transcribe};
