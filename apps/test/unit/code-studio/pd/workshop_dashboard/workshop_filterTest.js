import WorkshopFilter from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_filter';
import {expect} from '../../../../util/reconfiguredChai';

describe('WorkshopFilter component', () => {
  it('can create and combine subject options', () => {
    const currentSubjects = {
      CSF: [],
      CSD: ['C1'],
      CSP: ['C1', 'C2']
    };

    const legacySubjects = {CSD: ['L1'], CSP: ['L1', 'L2']};

    const testCases = [
      {
        current: currentSubjects,
        legacy: {},
        expected: {
          CSF: [],
          CSD: [{value: 'C1', label: 'C1'}],
          CSP: [{value: 'C1', label: 'C1'}, {value: 'C2', label: 'C2'}]
        }
      },
      {
        current: {},
        legacy: legacySubjects,
        expected: {
          CSD: [{value: 'L1', label: '[Legacy] L1'}],
          CSP: [
            {value: 'L1', label: '[Legacy] L1'},
            {value: 'L2', label: '[Legacy] L2'}
          ]
        }
      },
      {
        current: currentSubjects,
        legacy: legacySubjects,
        expected: {
          CSF: [],
          CSD: [
            {value: 'C1', label: 'C1'},
            {value: 'L1', label: '[Legacy] L1'}
          ],
          CSP: [
            {value: 'C1', label: 'C1'},
            {value: 'C2', label: 'C2'},
            {value: 'L1', label: '[Legacy] L1'},
            {value: 'L2', label: '[Legacy] L2'}
          ]
        }
      }
    ];

    testCases.forEach(testCase => {
      expect(
        WorkshopFilter.combineSubjectOptions(testCase.current, testCase.legacy)
      ).to.eql(testCase.expected);
    });
  });
});
