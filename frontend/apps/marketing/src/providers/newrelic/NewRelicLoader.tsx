'use client';
import {useEffect} from 'react';

import NewRelicAgent from '@/providers/newrelic/agent';

const NewRelicLoader = () => {
  useEffect(() => {
    NewRelicAgent.then(agent => {
      if (agent) {
        console.debug('New Relic initialized');
      }
    }).catch(error => console.debug('Error initializing New Relic', error));
  }, []);

  return null;
};

export default NewRelicLoader;
