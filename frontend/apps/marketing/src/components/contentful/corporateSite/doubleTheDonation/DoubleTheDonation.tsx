'use client';

import React, {useEffect} from 'react';

import {BodyOneText} from '@code-dot-org/component-library/typography';

import {DOUBLE_THE_DONATION_PUBLIC_KEY} from '@/config/doubleTheDonation';

declare global {
  interface Window {
    DDCONF?: {API_KEY: string};
  }
}

const DoubleTheDonationSearch: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.DDCONF = {
        API_KEY: DOUBLE_THE_DONATION_PUBLIC_KEY,
      };

      const script = document.createElement('script');
      script.src = 'https://doublethedonation.com/api/js/ddplugin.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  if (typeof window === 'undefined') {
    return (
      <div id="dd-container">
        <BodyOneText>
          Loading Double the Donation employee match search form...
        </BodyOneText>
      </div>
    );
  }

  return (
    <div id="dd-container">
      <a href="https://doublethedonation.com/matching-grant-resources/matching-gift-basics/">
        Matching Gift
      </a>
      {' and '}
      <a href="https://doublethedonation.com/matching-grant-resources/volunteer-grant-basics/">
        Volunteer Grant
      </a>
      {' information provided by '}
      <br />
      <a href="https://doublethedonation.com">
        <img
          alt="Powered by Double the Donation"
          src="https://doublethedonation.com/api/img/powered-by.png"
        />
      </a>
    </div>
  );
};

export default DoubleTheDonationSearch;
