import {getLoginSelector} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/createSectionOnboarding';

describe('getLoginSelector', () => {
  it('returns email login for exclusively high school grades', () => {
    expect(getLoginSelector(['9', '10', '11', '12'])).toBe(
      '.uitest-emailLogin'
    );
    expect(getLoginSelector(['9'])).toBe('.uitest-emailLogin');
    expect(getLoginSelector(['11', '12'])).toBe('.uitest-emailLogin');
  });

  it('returns picture login for exclusively elementary grades', () => {
    expect(getLoginSelector(['K', '1', '2', '3', '4', '5'])).toBe(
      '.uitest-pictureLogin'
    );
    expect(getLoginSelector(['K'])).toBe('.uitest-pictureLogin');
    expect(getLoginSelector(['2', '4'])).toBe('.uitest-pictureLogin');
  });

  it('returns word login for exclusively middle school grades', () => {
    expect(getLoginSelector(['6', '7', '8'])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(['7'])).toBe('.uitest-wordLogin');
  });

  it('returns word login for grades spanning multiple buckets', () => {
    expect(getLoginSelector(['9', '5', '2'])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(['9', '6'])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(['K', '8'])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(['3', '10'])).toBe('.uitest-wordLogin');
  });

  it('returns word login for empty or missing grade data', () => {
    expect(getLoginSelector([])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(null)).toBe('.uitest-wordLogin');
    expect(getLoginSelector(undefined)).toBe('.uitest-wordLogin');
  });
});
