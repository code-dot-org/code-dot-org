import {generateText as generateTextThroughProxy} from 'ai';

import {generateText as generateTextThroughGateway} from '@cdo/apps/aiGateway/aiSdkCompatibleGateway';

import {isAiGatewayEnabled} from './isAiGatewayEnabled';

export const generateText = isAiGatewayEnabled
  ? generateTextThroughGateway
  : generateTextThroughProxy;
