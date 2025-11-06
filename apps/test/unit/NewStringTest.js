import i18n from '@cdo/locale';

describe('newString test', function () {
  it('returns "New String"', function () {
    expect(i18n.newString()).toBe('New String');
  });
});
