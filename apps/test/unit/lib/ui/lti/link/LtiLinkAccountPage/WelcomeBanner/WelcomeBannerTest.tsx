import {render, screen} from '@testing-library/react';
import WelcomeBanner from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/WelcomeBanner';
import {
  LtiProviderContext,
  LtiProviderContextProps,
} from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/context';
import {LtiProvider} from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/types';
import React from 'react';
import i18n from '@cdo/locale';

const getContext = (ltiProvider: LtiProvider): LtiProviderContextProps => {
  return {
    ltiProvider,
    ltiProviderName: 'LMS',
    newAccountUrl: '/new-account',
    existingAccountUrl: new URL('https://test.com/existing-account'),
    emailAddress: 'test@code.org',
    newCtaType: 'new',
    continueAccountUrl: '/continue',
  };
};

describe('LTI Link Account Welcome Banner Tests', () => {
  (['canvas_cloud', 'schoology'] as LtiProvider[]).forEach(providerName => {
    describe(`Welcome Banner Tests for ${providerName}`, () => {
      it('should render an icon exchange', () => {
        render(
          <LtiProviderContext.Provider value={getContext(providerName)}>
            <WelcomeBanner />
          </LtiProviderContext.Provider>
        );
        // Should render provider image
        screen.getByAltText('LMS');
        // Should render code.org logo
        screen.getByAltText(i18n.codeLogo());
      });

      it('should render a header', () => {
        render(
          <LtiProviderContext.Provider value={getContext(providerName)}>
            <WelcomeBanner />
          </LtiProviderContext.Provider>
        );

        screen.getByText(i18n.ltiLinkAccountWelcomeBannerHeaderLabel());
      });

      it('should render welcone banner content for the provider', () => {
        render(
          <LtiProviderContext.Provider value={getContext(providerName)}>
            <WelcomeBanner />
          </LtiProviderContext.Provider>
        );
        screen.getByText(
          i18n.ltiLinkAccountWelcomeBannerContent({providerName: 'LMS'})
        );
      });
    });
  });
});
