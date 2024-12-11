import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Permission, {
  WorkshopAdmin,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {UnconnectedWorkshopFilter as WorkshopFilter} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_filter';

describe('WorkshopFilter component', () => {
  it('can create and combine subject options', () => {
    const currentSubjects = {
      CSF: [],
      CSD: ['C1'],
      CSP: ['C1', 'C2'],
    };

    const legacySubjects = {CSD: ['L1'], CSP: ['L1', 'L2']};

    const testCases = [
      {
        current: currentSubjects,
        legacy: {},
        expected: {
          CSF: [],
          CSD: [{value: 'C1', label: 'C1'}],
          CSP: [
            {value: 'C1', label: 'C1'},
            {value: 'C2', label: 'C2'},
          ],
        },
      },
      {
        current: {},
        legacy: legacySubjects,
        expected: {
          CSD: [{value: 'L1', label: '[Legacy] L1'}],
          CSP: [
            {value: 'L1', label: '[Legacy] L1'},
            {value: 'L2', label: '[Legacy] L2'},
          ],
        },
      },
      {
        current: currentSubjects,
        legacy: legacySubjects,
        expected: {
          CSF: [],
          CSD: [
            {value: 'C1', label: 'C1'},
            {value: 'L1', label: '[Legacy] L1'},
          ],
          CSP: [
            {value: 'C1', label: 'C1'},
            {value: 'C2', label: 'C2'},
            {value: 'L1', label: '[Legacy] L1'},
            {value: 'L2', label: '[Legacy] L2'},
          ],
        },
      },
    ];

    testCases.forEach(testCase => {
      expect(
        WorkshopFilter.combineSubjectOptions(testCase.current, testCase.legacy)
      ).toEqual(testCase.expected);
    });
  });

  it('uses date ascending ordering for Not Started workshops', () => {
    const ajaxStub = jest.spyOn($, 'ajax').mockReturnValue({
      done: successCallback => {
        successCallback();

        return {fail: () => {}};
      },
    });
    const permission = new Permission([WorkshopAdmin]);

    const workshopFilter = shallow(
      <WorkshopFilter
        permission={permission}
        location={{query: {state: 'Not Started'}}}
        regionalPartnerFilter={{value: 'all', label: 'All'}}
      />
    );

    expect(
      workshopFilter.find('ServerSortWorkshopTable').props().initialOrderBy
    ).toEqual('date asc');

    ajaxStub.mockRestore();
  });

  it('uses date descending ordering for In Progress workshops', () => {
    const ajaxStub = jest.spyOn($, 'ajax').mockReturnValue({
      done: successCallback => {
        successCallback();

        return {fail: () => {}};
      },
    });
    const permission = new Permission([WorkshopAdmin]);

    const workshopFilter = shallow(
      <WorkshopFilter
        permission={permission}
        location={{query: {state: 'In Progress'}}}
        regionalPartnerFilter={{value: 'all', label: 'All'}}
      />
    );

    expect(
      workshopFilter.find('ServerSortWorkshopTable').props().initialOrderBy
    ).toEqual('date desc');

    ajaxStub.mockRestore();
  });

  it('uses date descending ordering for Past workshops', () => {
    const ajaxStub = jest.spyOn($, 'ajax').mockReturnValue({
      done: successCallback => {
        successCallback();

        return {fail: () => {}};
      },
    });
    const permission = new Permission([WorkshopAdmin]);

    const workshopFilter = shallow(
      <WorkshopFilter
        permission={permission}
        location={{query: {state: 'Ended'}}}
        regionalPartnerFilter={{value: 'all', label: 'All'}}
      />
    );

    expect(
      workshopFilter.find('ServerSortWorkshopTable').props().initialOrderBy
    ).toEqual('date desc');

    ajaxStub.mockRestore();
  });
});
