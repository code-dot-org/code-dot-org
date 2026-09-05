import {courseIdFromSectionCode} from '@cdo/apps/templates/teacherDashboard/sectionCodeHelpers';

describe('courseIdFromSectionCode', () => {
  it('strips the G- prefix from Google Classroom codes', () => {
    expect(courseIdFromSectionCode('G-12345')).toBe('12345');
  });

  it('strips the C- prefix from Clever codes', () => {
    expect(courseIdFromSectionCode('C-5966ed736b21538e3c000004')).toBe(
      '5966ed736b21538e3c000004'
    );
  });

  it('yields just the class sourcedId from a ClassLink code', () => {
    // CL-<TenantId>|<classSourcedId>: the tenant is never sent; the server
    // derives it from the signed-in user.
    expect(courseIdFromSectionCode('CL-2222|33333')).toBe('33333');
  });

  it('keeps everything after the first pipe when the sourcedId contains one', () => {
    expect(courseIdFromSectionCode('CL-2222|a|b')).toBe('a|b');
  });

  it('handles non-numeric district-supplied sourcedIds', () => {
    expect(courseIdFromSectionCode('CL-2222|5678_T5678-0005')).toBe(
      '5678_T5678-0005'
    );
  });
});
