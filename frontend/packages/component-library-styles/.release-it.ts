import type {Config} from 'release-it';
import {createConfig} from '@code-dot-org/changelogs';
import packageJson from './package.json';

export default createConfig(packageJson.name) satisfies Config;
