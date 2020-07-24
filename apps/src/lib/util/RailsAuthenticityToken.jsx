import React from 'react';
import logToCloud from '../../logToCloud';

/**
 * React component that renders a hidden input populated with the name and
 * value for a Rails authenticity token as retrieved from meta tags in the
 * page's head.
 * This is necessary for React-rendered forms to submit to Rails endpoints
 * that have CSRF protection enabled.
 */
export default class RailsAuthenticityToken extends React.Component {
  static getRailsCSRFMetaTags() {
    const metaParam = document.querySelector('meta[name="csrf-param"]');
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (!metaParam || !metaToken) {
      throw new Error(
        'Tried to render an authenticity token into the form but CSRF meta tags were not found.'
      );
    }
    return {param: metaParam.content, token: metaToken.content};
  }

  render() {
    try {
      const {param, token} = RailsAuthenticityToken.getRailsCSRFMetaTags();
      return <input type="hidden" name={param} value={token} />;
    } catch (error) {
      logToCloud.logError(error);
      return null;
    }
  }
}
