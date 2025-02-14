import type {NextConfig} from 'next';
import {i18n} from './next-18next.config'

const nextConfig: NextConfig = {
  output: 'standalone',
  i18n
};

export default nextConfig;
