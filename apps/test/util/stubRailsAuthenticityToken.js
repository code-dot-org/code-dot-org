import sinon from 'sinon';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

// Stub the DOM-dependent behavior of the RailsAuthenticityToken component, so
// we don't have to actually build meta tags in our tests.
export function stubRailsAuthenticityToken() {
  // Ignore redundant calls to this function, which makes it easier to use in storybook
  if (
    'function' !== typeof RailsAuthenticityToken.getRailsCSRFMetaTags.restore
  ) {
    sinon
      .stub(RailsAuthenticityToken, 'getRailsCSRFMetaTags')
      .returns({param: undefined, token: undefined});
  }
}

export function unstubRailsAuthenticityToken() {
  RailsAuthenticityToken.getRailsCSRFMetaTags.restore();
}
