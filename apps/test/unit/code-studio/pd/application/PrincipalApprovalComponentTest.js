import {expect} from 'chai';
import PrincipalApprovalComponent, {
  RACE_LIST,
  MANUAL_SCHOOL_FIELDS,
  REQUIRED_SCHOOL_INFO_FIELDS,
  ALWAYS_REQUIRED_FIELDS
} from '@cdo/apps/code-studio/pd/application/principalApproval/PrincipalApprovalComponent';

describe('Principal Approval Component', () => {
  it('Requires only the top few fields if application is rejected', () => {
    expect(
      PrincipalApprovalComponent.getDynamicallyRequiredFields({
        doYouApprove: 'No'
      })
    ).to.deep.equal(ALWAYS_REQUIRED_FIELDS);
  });

  it('Requires more fields if the application is accepted', () => {
    const expectedFields = [
      ...ALWAYS_REQUIRED_FIELDS,
      ...REQUIRED_SCHOOL_INFO_FIELDS
    ];
    const actualFields = PrincipalApprovalComponent.getDynamicallyRequiredFields(
      {
        doYouApprove: 'Yes'
      }
    );
    expect(actualFields).to.deep.equal(expectedFields);
  });

  it('Requires more fields if the application is accepted and the school is manually entered', () => {
    const expectedFields = [
      ...ALWAYS_REQUIRED_FIELDS,
      ...REQUIRED_SCHOOL_INFO_FIELDS,
      ...MANUAL_SCHOOL_FIELDS
    ].sort();
    const actualFields = PrincipalApprovalComponent.getDynamicallyRequiredFields(
      {
        doYouApprove: 'Yes',
        school: '-1'
      }
    ).sort();
    expect(actualFields).to.deep.equal(expectedFields);
  });

  it('Requires more fields if the application is accepted and is replacing a csd course', () => {
    const expectedFields = [
      ...ALWAYS_REQUIRED_FIELDS,
      ...REQUIRED_SCHOOL_INFO_FIELDS,
      'replaceWhichCourseCsd'
    ].sort();
    const actualFields = PrincipalApprovalComponent.getDynamicallyRequiredFields(
      {
        doYouApprove: 'Yes',
        course: 'Computer Science Discoveries',
        replaceCourse: 'Yes'
      }
    ).sort();
    expect(actualFields).to.deep.equal(expectedFields);
  });

  it('Requires more fields if the application is accepted and is replacing a csp course', () => {
    const expectedFields = [
      ...ALWAYS_REQUIRED_FIELDS,
      ...REQUIRED_SCHOOL_INFO_FIELDS,
      'replaceWhichCourseCsp'
    ].sort();
    const actualFields = PrincipalApprovalComponent.getDynamicallyRequiredFields(
      {
        doYouApprove: 'Yes',
        course: 'Computer Science Principles',
        replaceCourse: 'Yes'
      }
    ).sort();
    expect(actualFields).to.deep.equal(expectedFields);
  });

  it('Expect student enrollment to be a positive integer', () => {
    ['10000', '1,000,000'].forEach(validEnrollmentNumber => {
      expect(
        PrincipalApprovalComponent.getErrorMessages({
          totalStudentEnrollment: validEnrollmentNumber
        })
      ).to.deep.equal({});
    });
  });

  it('Invalid values create errors for student enrollments', () => {
    ['0', '10.5', 'So many', '0x1234'].forEach(invalidEnrollmentNumber => {
      expect(
        PrincipalApprovalComponent.getErrorMessages({
          totalStudentEnrollment: invalidEnrollmentNumber
        })
      ).to.deep.equal({
        totalStudentEnrollment: 'Must be a valid and positive number'
      });
    });
  });

  it('Expect free lunch and race to be a percentage', () => {
    ['freeLunchPercent', ...RACE_LIST].forEach(key => {
      ['0', '1', '5%', '25.6%', '100'].forEach(validPercent => {
        expect(
          PrincipalApprovalComponent.getErrorMessages({
            [key]: validPercent
          })
        ).to.deep.equal({});
      });
    });
  });

  it('Non percentages are not valid race or free lunch percents', () => {
    ['freeLunchPercent', ...RACE_LIST].forEach(key => {
      ['-1', '100.5', '100.5%'].forEach(invalidPercent => {
        expect(
          PrincipalApprovalComponent.getErrorMessages({
            [key]: invalidPercent
          })
        ).to.deep.equal({
          [key]: 'Must be a valid percent between 0 and 100'
        });
      });
    });
  });
});
