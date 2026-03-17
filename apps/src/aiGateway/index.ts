import {
  generateText as generateTextThroughProxy,
  experimental_transcribe as transcribeThroughProxy,
} from 'ai';

import {generateText as generateTextThroughGateway} from '@cdo/apps/aiGateway/aiSdkCompatibleGateway';
import {queryParams} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';

import transcribeThroughGateway from './transcribeThroughGateway';

const isAiGatewayEnabled =
  DCDO.get('ai-gateway-enabled', true) ||
  queryParams('use-ai-gateway') === 'true';

const generateText = isAiGatewayEnabled
  ? generateTextThroughGateway
  : generateTextThroughProxy;

const transcribe = isAiGatewayEnabled
  ? transcribeThroughGateway
  : transcribeThroughProxy;

export {isAiGatewayEnabled, generateText, transcribe};
