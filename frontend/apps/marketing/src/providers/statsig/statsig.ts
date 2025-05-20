import {Statsig} from '@statsig/statsig-node-core';

import {getStage} from '@/config/stage';

export default process.env.STATSIG_SERVER_KEY
  ? new Statsig(process.env.STATSIG_SERVER_KEY, {environment: getStage()})
  : undefined;
