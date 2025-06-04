import {Brand} from '@/config/brand';
import {getStage} from '@/config/stage';

import {
  getOneTrustDomainId,
  getOnetrustAutoBlockScriptPath,
  getOnetrustStubScriptPath,
} from '../index';

jest.mock('@/config/stage', () => ({
  getStage: jest.fn(),
}));

const getStageMock = getStage as jest.Mock;

describe('OneTrust Config Functions', () => {
  describe('getOneTrustDomainId', () => {
    it('should return the production domain id for production stage', () => {
      getStageMock.mockReturnValue('production');
      const result = getOneTrustDomainId(Brand.CODE_DOT_ORG);
      expect(result).toBe('27cca70a-7db3-4852-9ef0-a6660fd0977d');
    });

    it('should return the test domain id for non-production stage', () => {
      getStageMock.mockReturnValue('staging');
      const result = getOneTrustDomainId(Brand.HOUR_OF_CODE);
      expect(result).toBe('7c79c547-a2fc-4998-9b21-0c7a5e67e345-test');
    });

    it('should return undefined for unknown brand', () => {
      getStageMock.mockReturnValue('production');
      const result = getOneTrustDomainId('UNKNOWN_BRAND' as Brand);
      expect(result).toBeUndefined();
    });
  });

  describe('getOnetrustAutoBlockScriptPath', () => {
    it('should return the correct script path for production stage', () => {
      getStageMock.mockReturnValue('production');
      const result = getOnetrustAutoBlockScriptPath(Brand.CODE_DOT_ORG);
      expect(result).toBe(
        '/_next/static/public/onetrust/code.org/consent/27cca70a-7db3-4852-9ef0-a6660fd0977d/OtAutoBlock.js',
      );
    });

    it('should return the correct script path for production hour of code', () => {
      getStageMock.mockReturnValue('production');
      const result = getOnetrustAutoBlockScriptPath(Brand.HOUR_OF_CODE);
      expect(result).toBe(
        '/_next/static/public/onetrust/hourofcode.com/consent/7c79c547-a2fc-4998-9b21-0c7a5e67e345/OtAutoBlock.js',
      );
    });

    it('should return the correct script path for non-production stage', () => {
      getStageMock.mockReturnValue('staging');
      const result = getOnetrustAutoBlockScriptPath(Brand.HOUR_OF_CODE);
      expect(result).toBe(
        'https://cdn.cookielaw.org/consent/7c79c547-a2fc-4998-9b21-0c7a5e67e345-test/OtAutoBlock.js',
      );
    });
  });

  describe('getOnetrustStubScriptPath', () => {
    it('should return the correct stub script path for production stage', () => {
      getStageMock.mockReturnValue('production');
      const result = getOnetrustStubScriptPath(Brand.CODE_DOT_ORG);
      expect(result).toBe(
        '/_next/static/public/onetrust/code.org/scripttemplates/otSDKStub.js',
      );
    });

    it('should return the correct stub script path for non-production stage', () => {
      getStageMock.mockReturnValue('staging');
      const result = getOnetrustStubScriptPath(Brand.HOUR_OF_CODE);
      expect(result).toBe(
        'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
      );
    });
  });
});
