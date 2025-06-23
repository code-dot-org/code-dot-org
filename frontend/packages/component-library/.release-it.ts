import {createConfig} from '@code-dot-org/changelogs';

import packageJson from './package.json';

const config = createConfig(packageJson.name);

export default config;
