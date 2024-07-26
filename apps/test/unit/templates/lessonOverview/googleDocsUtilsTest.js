import * as utils from '@cdo/apps/templates/lessonOverview/googleDocsUtils';

const {isGDocsUrl, gDocsBaseUrl, gDocsPdfUrl, gDocsMsOfficeUrl, gDocsCopyUrl} =
  utils;

describe('googleDocsUtils module', () => {
  describe('the isGDocsUrl function', () => {
    it('returns false when the url is not valid', () => {
      expect(isGDocsUrl('not valid')).toBe(false);
      expect(isGDocsUrl('https://example.com/')).toBe(false);
      expect(isGDocsUrl('https://example.com/document/d/Some-ID')).toBe(false);
      expect(isGDocsUrl('https://docs.google.com/document/d/')).toBe(false);
      expect(isGDocsUrl('https://docs.google.com/document/d/?not-valid')).toBe(
        false
      );
      expect(isGDocsUrl('https://docs.google.com/document/not-valid')).toBe(
        false
      );
      expect(isGDocsUrl('https://docs.google.com/not-valid')).toBe(false);
    });

    it('returns true when the url is valid', () => {
      expect(isGDocsUrl('https://docs.google.com/document/d/Some-ID')).toBe(
        true
      );
      expect(isGDocsUrl('https://docs.google.com/document/d/Some-ID/')).toBe(
        true
      );
      expect(isGDocsUrl('http://docs.google.com/document/d/Some-ID')).toBe(
        true
      );
      expect(isGDocsUrl('https://docs.google.com/presentation/d/Some-ID')).toBe(
        true
      );
      expect(
        isGDocsUrl('https://docs.google.com/document/d/_-123Some-ID')
      ).toBe(true);
      expect(
        isGDocsUrl('https://docs.google.com/document/d/Some-ID/copy')
      ).toBe(true);
      expect(
        isGDocsUrl('https://docs.google.com/document/d/Some-ID/edit')
      ).toBe(true);
      expect(
        isGDocsUrl(
          'https://docs.google.com/document/d/Some-ID/export?format=pdf'
        )
      ).toBe(true);
    });
  });

  describe('the gDocsBaseUrl function', () => {
    it('returns the correct base URL', () => {
      expect(gDocsBaseUrl('https://docs.google.com/document/d/Some-ID')).toBe(
        'https://docs.google.com/document/d/Some-ID'
      );
      expect(gDocsBaseUrl('https://docs.google.com/document/d/Some-ID/')).toBe(
        'https://docs.google.com/document/d/Some-ID'
      );
      expect(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID/edit')
      ).toBe('https://docs.google.com/document/d/Some-ID');
      expect(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID/copy')
      ).toBe('https://docs.google.com/document/d/Some-ID');
      expect(gDocsBaseUrl('https://docs.google.com/document/d/--_123ID')).toBe(
        'https://docs.google.com/document/d/--_123ID'
      );
      expect(gDocsBaseUrl('http://docs.google.com/document/d/Some-ID')).toBe(
        'https://docs.google.com/document/d/Some-ID'
      );
      expect(
        gDocsBaseUrl('https://docs.google.com/presentation/d/Some-ID')
      ).toBe('https://docs.google.com/presentation/d/Some-ID');
      expect(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID?someQuery')
      ).toBe('https://docs.google.com/document/d/Some-ID');
      expect(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID#someID')
      ).toBe('https://docs.google.com/document/d/Some-ID');
    });
  });

  describe('the gDocsPdfUrl function', () => {
    it('returns the expected URL', () => {
      expect(
        gDocsPdfUrl('https://docs.google.com/document/d/Some-ID/edit')
      ).toBe('https://docs.google.com/document/d/Some-ID/export?format=pdf');
      expect(
        gDocsPdfUrl('https://docs.google.com/presentation/d/Some-ID/edit')
      ).toBe(
        'https://docs.google.com/presentation/d/Some-ID/export?format=pdf'
      );
    });
  });

  describe('the gDocsMsOfficeUrl function', () => {
    it('returns the expected URL', () => {
      expect(
        gDocsMsOfficeUrl('https://docs.google.com/document/d/Some-ID/edit')
      ).toBe('https://docs.google.com/document/d/Some-ID/export?format=doc');
      expect(
        gDocsMsOfficeUrl('https://docs.google.com/presentation/d/Some-ID/edit')
      ).toBe(
        'https://docs.google.com/presentation/d/Some-ID/export?format=pptx'
      );
    });
  });

  describe('the gDocsCopyUrl function', () => {
    it('returns the expected URL', () => {
      expect(
        gDocsCopyUrl('https://docs.google.com/document/d/Some-ID/edit')
      ).toBe('https://docs.google.com/document/d/Some-ID/copy');
      expect(
        gDocsCopyUrl('https://docs.google.com/presentation/d/Some-ID/edit')
      ).toBe('https://docs.google.com/presentation/d/Some-ID/copy');
    });
  });
});
