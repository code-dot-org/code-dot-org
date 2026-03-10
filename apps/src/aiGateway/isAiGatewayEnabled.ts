import {queryParams} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';

export const isAiGatewayEnabled =
  DCDO.get('ai-gateway-enabled', true) ||
  queryParams('use-ai-gateway') === 'true';
