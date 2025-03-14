import type {MetadataRoute} from 'next';
import {getStage} from '@/config/stage';

const DISALLOW_ALL = {
  userAgent: '*',
  disallow: '/',
};

export default function robots(): MetadataRoute.Robots {
  const rules = [];

  if (getStage() !== 'production') {
    rules.push(DISALLOW_ALL);
  }

  return {
    rules,
  };
}
