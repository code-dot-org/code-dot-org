import {render, waitFor, cleanup} from '@testing-library/react';

import DoubleTheDonationSearch from '../DoubleTheDonation';

jest.mock('@/providers/environment', () => ({
  getEnv: jest.fn(() => 'test-api-key'),
}));

describe('DoubleTheDonationSearch', () => {
  beforeEach(() => {
    // Remove any previously injected script
    cleanup();
    // Reset global DDCONF
    delete window.DDCONF;
  });

  it('sets window.DDCONF and injects script after mount', async () => {
    render(<DoubleTheDonationSearch />);
    await waitFor(() => {
      expect(window.DDCONF).toBeDefined();
      expect(window.DDCONF?.API_KEY).toBe('test-api-key');
      const script = Array.from(document.getElementsByTagName('script')).find(
        s => s.src === 'https://doublethedonation.com/api/js/ddplugin.js',
      );
      expect(script).toBeTruthy();
    });
  });

  it('removes the injected script on unmount', async () => {
    const {unmount} = render(<DoubleTheDonationSearch />);
    let script: HTMLScriptElement | undefined;
    await waitFor(() => {
      script = Array.from(document.getElementsByTagName('script')).find(
        s => s.src === 'https://doublethedonation.com/api/js/ddplugin.js',
      );
      expect(script).toBeTruthy();
    });
    unmount();
    await waitFor(() => {
      script = Array.from(document.getElementsByTagName('script')).find(
        s => s.src === 'https://doublethedonation.com/api/js/ddplugin.js',
      );
      expect(script).toBeFalsy();
    });
  });
});
