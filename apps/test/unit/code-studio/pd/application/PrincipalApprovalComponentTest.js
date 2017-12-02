import {expect} from 'chai';
import PrincipalApprovalComponent, {RACE_LIST, MANUAL_SCHOOL_FIELDS, REQUIRED_SCHOOL_INFO_FIELDS} from '@cdo/apps/code-studio/pd/application/principalApproval1819/PrincipalApprovalComponent';

describe("Principal Approval Component", () => {
  it("Requires only the top few fields if application is rejected", () => {
    expect(PrincipalApprovalComponent.getDynamicallyRequiredFields({
      doYouApprove: 'No'
    })).to.deep.equal([]);
  });

  it("Requires more fields if the application is accepted", () => {
    expect(PrincipalApprovalComponent.getDynamicallyRequiredFields({
      doYouApprove: 'Yes'
    })).to.deep.equal(REQUIRED_SCHOOL_INFO_FIELDS);
  });

  it("Requires more fields if the application is accepted and the school is manually entered", () => {
    expect(PrincipalApprovalComponent.getDynamicallyRequiredFields({
      doYouApprove: 'Yes',
      school: '-1'
    }).sort()).to.deep.equal([...REQUIRED_SCHOOL_INFO_FIELDS, ...MANUAL_SCHOOL_FIELDS].sort());
  });

  it("Requires more fields if the application is accepted and is replacing a csd course", () => {
    expect(PrincipalApprovalComponent.getDynamicallyRequiredFields({
      doYouApprove: 'Yes',
      course: 'Computer Science Discoveries',
      replaceCourse: 'Yes'
    }).sort()).to.deep.equal([...REQUIRED_SCHOOL_INFO_FIELDS, 'replaceWhichCourseCsd'].sort());
  });

  it("Requires more fields if the application is accepted and is replacing a csp course", () => {
    expect(PrincipalApprovalComponent.getDynamicallyRequiredFields({
      doYouApprove: 'Yes',
      course: 'Computer Science Principles',
      replaceCourse: 'Yes'
    }).sort()).to.deep.equal([...REQUIRED_SCHOOL_INFO_FIELDS, 'replaceWhichCourseCsp'].sort());
  });

  it("Expect student enrollment to be an integer", () => {
    ['10000', '1,000,000'].forEach((validEnrollmentNumber) => {
      expect(PrincipalApprovalComponent.getErrorMessages({
        totalStudentEnrollment: validEnrollmentNumber
      })).to.deep.equal({});
    });
  });

  it("Non integers create errors for student enrollments", () => {
    ['10.5', 'So many', '0x1234'].forEach((invalidEnrollmentNumber) => {
      expect(PrincipalApprovalComponent.getErrorMessages({
        totalStudentEnrollment: invalidEnrollmentNumber
      })).to.deep.equal({
        totalStudentEnrollment: 'Must be a valid number'
      });
    });
  });

  it("Expect free lunch and race to be a percentage", () => {
    ['freeLunchPercent', ...RACE_LIST].forEach((key) => {
      ['0', '1', '5%', '25.6%', '100'].forEach((validPercent) => {
        expect(PrincipalApprovalComponent.getErrorMessages({
          [key]: validPercent
        })).to.deep.equal({});
      });
    });
  });

  it("Non percentages are not valid race or free lunch percents", () => {
    ['freeLunchPercent', ...RACE_LIST].forEach((key) => {
      ['-1', '100.5', '100.5%'].forEach((invalidPercent) => {
        expect(PrincipalApprovalComponent.getErrorMessages({
          [key]: invalidPercent
        })).to.deep.equal({
          [key]: 'Must be a valid percent between 0 and 100'
        });
      });
    });
  });
});
