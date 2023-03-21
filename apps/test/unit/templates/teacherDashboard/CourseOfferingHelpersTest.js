import {expect} from '../../../util/reconfiguredChai';
import {
  translatedCourseOfferingCsTopics,
  translatedCourseOfferingSchoolSubjects,
  translatedCourseOfferingDeviceTypes,
  translatedCourseOfferingDeviceCompatibilityLevels
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';

describe('CourseOfferingHelpers', () => {
  it('each translatedCourseOfferingCsTopics constant is mapped to a non-empty string', () => {
    Object.values(translatedCourseOfferingCsTopics).forEach(cs_topic => {
      expect(cs_topic).to.not.equal('');
    });
  });

  it('each translatedCourseOfferingSchoolSubjects constant is mapped to a non-empty string', () => {
    Object.values(translatedCourseOfferingSchoolSubjects).forEach(
      school_subject => {
        expect(school_subject).to.not.equal('');
      }
    );
  });

  it('each translatedCourseOfferingDeviceTypes constant is mapped to a non-empty string', () => {
    Object.values(translatedCourseOfferingDeviceTypes).forEach(device => {
      expect(device).to.not.equal('');
    });
  });

  it('each translatedCourseOfferingDeviceCompatibilityLevels constant is mapped to a non-empty string', () => {
    Object.values(translatedCourseOfferingDeviceCompatibilityLevels).forEach(
      compatibility_level => {
        expect(compatibility_level).to.not.equal('');
      }
    );
  });
});
