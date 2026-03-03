import {queryParams} from '@cdo/apps/code-studio/utils';

export const isAiGatewayEnabled = queryParams('use-ai-gateway') === 'true';
