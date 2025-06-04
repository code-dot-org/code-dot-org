'use client';
import {useEffect} from 'react';

import {initializeHoneybadger} from '@/providers/honeybadger/agent';

const HoneybadgerLoader = () => {
  useEffect(() => {
    initializeHoneybadger();
  }, []);

  return null;
};

export default HoneybadgerLoader;
