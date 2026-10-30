import {
  shouldUseFoormSurvey,
  shouldShowSurveyResults,
} from '../../../../../src/code-studio/pd/workshop_dashboard/workshop_summary_utils';

describe('Workshop Summary Utils', () => {
  it('shouldUseFoormSurvey returns correct result', () => {
    expect(
      shouldUseFoormSurvey('District', new Date('2020-05-08'))
    ).toBeTruthy();
    expect(shouldUseFoormSurvey('Intro', new Date('2020-05-08'))).toBeTruthy();
    expect(!shouldUseFoormSurvey('Intro', new Date('2020-04-01'))).toBeTruthy();
    expect(
      !shouldUseFoormSurvey('5-day Summer', new Date('2019-07-01'))
    ).toBeTruthy();
    expect(
      shouldUseFoormSurvey('5-day Summer', new Date('2020-07-01'))
    ).toBeTruthy();
    expect(
      shouldUseFoormSurvey(
        'Workshop for Returning Teachers',
        new Date('2020-06-01')
      )
    ).toBeTruthy();
    expect(
      shouldUseFoormSurvey('Academic Year Workshop 1', new Date('2020-09-01'))
    ).toBeTruthy();
    expect(
      !shouldUseFoormSurvey('Workshop 1: Unit 3', new Date('2019-09-01'))
    ).toBeTruthy();
  });

  it('shouldShowSurveyResults returns correct result', () => {
    expect(
      shouldShowSurveyResults(
        'Ended',
        'CS Fundamentals',
        'Intro',
        new Date('2020-05-08')
      )
    ).toBeTruthy();

    expect(
      !shouldShowSurveyResults(
        'Ended',
        'CS Fundamentals',
        'Intro',
        new Date('2020-04-08')
      )
    ).toBeTruthy();

    expect(
      !shouldShowSurveyResults(
        'In Progress',
        'CS Fundamentals',
        'Intro',
        new Date('2020-05-08')
      )
    ).toBeTruthy();

    expect(
      shouldShowSurveyResults(
        'Not Started',
        'CS Principles',
        '5-day Summer',
        new Date('2020-06-08')
      )
    ).toBeTruthy();

    expect(
      shouldShowSurveyResults(
        'Not Started',
        'CS Fundamentals',
        'Deep Dive',
        new Date('2020-06-08')
      )
    ).toBeTruthy();

    expect(
      shouldShowSurveyResults(
        'Not Started',
        'CS Fundamentals',
        'District',
        new Date('2020-05-08')
      )
    ).toBeTruthy();
  });
});
