import {assert} from '../../../../util/reconfiguredChai';
import {
  shouldUseFoormSurvey,
  shouldShowSurveyResults
} from '../../../../../src/code-studio/pd/workshop_dashboard/workshop_summary_utils';

describe('Workshop Summary Utils', () => {
  it('shouldUseFoormSurvey returns correct result', () => {
    assert(
      shouldUseFoormSurvey('District', new Date('2020-05-08')),
      'CSF District uses Foorm'
    );
    assert(
      shouldUseFoormSurvey('Intro', new Date('2020-05-08')),
      'CSF Intro past May 2020 uses Foorm'
    );
    assert(
      !shouldUseFoormSurvey('Intro', new Date('2020-04-01')),
      'CSF Intro pre May 2020 does not use Foorm'
    );
    assert(
      !shouldUseFoormSurvey('5-day Summer', new Date('2019-07-01')),
      '5-day summer pre May 2020 does not use Foorm'
    );
    assert(
      shouldUseFoormSurvey('5-day Summer', new Date('2020-07-01')),
      '5-day summer post May 2020 uses Foorm'
    );
    assert(
      shouldUseFoormSurvey(
        'Workshop for Returning Teachers',
        new Date('2020-06-01')
      ),
      'CSP for returning teachers uses Foorm'
    );
    assert(
      shouldUseFoormSurvey('Academic Year Workshop 1', new Date('2020-09-01')),
      'Academic Year Workshops for use Foorm'
    );
    assert(
      !shouldUseFoormSurvey('Workshop 1: Unit 3', new Date('2019-09-01')),
      'Legacy Academic Year Workshops do not use Foorm'
    );
  });

  it('shouldShowSurveyResults returns correct result', () => {
    assert(
      shouldShowSurveyResults(
        'Ended',
        'CS Fundamentals',
        'Intro',
        new Date('2020-05-08')
      ),
      'Ended CSF Intro past May 2020 shows button'
    );

    assert(
      !shouldShowSurveyResults(
        'Ended',
        'CS Fundamentals',
        'Intro',
        new Date('2020-04-08')
      ),
      'Ended CSF Intro pre May 2020 does not show button'
    );

    assert(
      !shouldShowSurveyResults(
        'In Progress',
        'CS Fundamentals',
        'Intro',
        new Date('2020-05-08')
      ),
      'In Progress CSF Intro past May 2020 does not show button'
    );

    assert(
      shouldShowSurveyResults(
        'Not Started',
        'CS Principles',
        '5-day Summer',
        new Date('2020-06-08')
      ),
      'Any CSP 5-day summer shows button'
    );

    assert(
      shouldShowSurveyResults(
        'Not Started',
        'CS Fundamentals',
        'Deep Dive',
        new Date('2020-06-08')
      ),
      'Any CSF Deep Dive shows button'
    );

    assert(
      shouldShowSurveyResults(
        'Not Started',
        'CS Fundamentals',
        'District',
        new Date('2020-05-08')
      ),
      'Any CSF District shows button'
    );
  });
});
