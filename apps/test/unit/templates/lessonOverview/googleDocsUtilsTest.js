import {assert} from '../../../util/reconfiguredChai';
import * as utils from '@cdo/apps/templates/lessonOverview/googleDocsUtils';
const {isGDocsUrl, gDocsBaseUrl, gDocsPdfUrl, gDocsMsOfficeUrl, gDocsCopyUrl} =
  utils;

describe('googleDocsUtils module', () => {
  describe('the isGDocsUrl function', () => {
    it('returns false when the url is not valid', () => {
      assert.isFalse(isGDocsUrl('not valid'));
      assert.isFalse(isGDocsUrl('https://example.com/'));
      assert.isFalse(isGDocsUrl('https://example.com/document/d/Some-ID'));
      assert.isFalse(isGDocsUrl('https://docs.google.com/document/d/'));
      assert.isFalse(
        isGDocsUrl('https://docs.google.com/document/d/?not-valid')
      );
      assert.isFalse(isGDocsUrl('https://docs.google.com/document/not-valid'));
      assert.isFalse(isGDocsUrl('https://docs.google.com/not-valid'));
    });

    it('returns true when the url is valid', () => {
      assert.isTrue(isGDocsUrl('https://docs.google.com/document/d/Some-ID'));
      assert.isTrue(isGDocsUrl('https://docs.google.com/document/d/Some-ID/'));
      assert.isTrue(isGDocsUrl('http://docs.google.com/document/d/Some-ID'));
      assert.isTrue(
        isGDocsUrl('https://docs.google.com/presentation/d/Some-ID')
      );
      assert.isTrue(
        isGDocsUrl('https://docs.google.com/document/d/_-123Some-ID')
      );
      assert.isTrue(
        isGDocsUrl('https://docs.google.com/document/d/Some-ID/copy')
      );
      assert.isTrue(
        isGDocsUrl('https://docs.google.com/document/d/Some-ID/edit')
      );
      assert.isTrue(
        isGDocsUrl(
          'https://docs.google.com/document/d/Some-ID/export?format=pdf'
        )
      );
    });
  });

  describe('the gDocsBaseUrl function', () => {
    it('returns the correct base URL', () => {
      assert.strictEqual(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID'),
        'https://docs.google.com/document/d/Some-ID'
      );
      assert.strictEqual(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID/'),
        'https://docs.google.com/document/d/Some-ID'
      );
      assert.strictEqual(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID/edit'),
        'https://docs.google.com/document/d/Some-ID'
      );
      assert.strictEqual(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID/copy'),
        'https://docs.google.com/document/d/Some-ID'
      );
      assert.strictEqual(
        gDocsBaseUrl('https://docs.google.com/document/d/--_123ID'),
        'https://docs.google.com/document/d/--_123ID'
      );
      assert.strictEqual(
        gDocsBaseUrl('http://docs.google.com/document/d/Some-ID'),
        'https://docs.google.com/document/d/Some-ID'
      );
      assert.strictEqual(
        gDocsBaseUrl('https://docs.google.com/presentation/d/Some-ID'),
        'https://docs.google.com/presentation/d/Some-ID'
      );
      assert.strictEqual(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID?someQuery'),
        'https://docs.google.com/document/d/Some-ID'
      );
      assert.strictEqual(
        gDocsBaseUrl('https://docs.google.com/document/d/Some-ID#someID'),
        'https://docs.google.com/document/d/Some-ID'
      );
    });
  });

  describe('the gDocsPdfUrl function', () => {
    it('returns the expected URL', () => {
      assert.strictEqual(
        gDocsPdfUrl('https://docs.google.com/document/d/Some-ID/edit'),
        'https://docs.google.com/document/d/Some-ID/export?format=pdf'
      );
      assert.strictEqual(
        gDocsPdfUrl('https://docs.google.com/presentation/d/Some-ID/edit'),
        'https://docs.google.com/presentation/d/Some-ID/export?format=pdf'
      );
    });
  });

  describe('the gDocsMsOfficeUrl function', () => {
    it('returns the expected URL', () => {
      assert.strictEqual(
        gDocsMsOfficeUrl('https://docs.google.com/document/d/Some-ID/edit'),
        'https://docs.google.com/document/d/Some-ID/export?format=doc'
      );
      assert.strictEqual(
        gDocsMsOfficeUrl('https://docs.google.com/presentation/d/Some-ID/edit'),
        'https://docs.google.com/presentation/d/Some-ID/export?format=pptx'
      );
    });
  });

  describe('the gDocsCopyUrl function', () => {
    it('returns the expected URL', () => {
      assert.strictEqual(
        gDocsCopyUrl('https://docs.google.com/document/d/Some-ID/edit'),
        'https://docs.google.com/document/d/Some-ID/copy'
      );
      assert.strictEqual(
        gDocsCopyUrl('https://docs.google.com/presentation/d/Some-ID/edit'),
        'https://docs.google.com/presentation/d/Some-ID/copy'
      );
    });
  });
});
