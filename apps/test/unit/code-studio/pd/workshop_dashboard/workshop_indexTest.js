import {expect} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Permission, {
  Facilitator,
  CsfFacilitator,
  Organizer,
  ProgramManager,
  WorkshopAdmin,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {WorkshopIndex} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_index';

describe('WorkshopIndex', () => {
  const fakeRouter = {
    createHref() {},
  };
  const context = {
    router: fakeRouter,
  };

  beforeEach(() => {
    sinon.mock(fakeRouter);
  });

  describe('Button counts', () => {
    // map each user permission that utilizes the Workshop Dashboard
    // to the list of buttons to which it has access
    let permissionButtonMap = new Map([
      [Facilitator, ['Legacy Facilitator Survey Summaries', 'Filter View']],
      [
        CsfFacilitator,
        ['New Workshop', 'Legacy Facilitator Survey Summaries', 'Filter View'],
      ],
      [Organizer, ['New Workshop', 'Attendance Reports', 'Filter View']],
      [ProgramManager, ['New Workshop', 'Attendance Reports', 'Filter View']],
      [
        WorkshopAdmin,
        [
          'New Workshop',
          'Attendance Reports',
          'Filter View',
          'Export Survey Results',
        ],
      ],
    ]);

    permissionButtonMap.forEach(function (buttons, permissionName) {
      it(permissionName + ' has ' + buttons.length + ' buttons', () => {
        const permission = new Permission([permissionName]);

        let workshopIndex = shallow(<WorkshopIndex permission={permission} />, {
          context,
        });

        expect(workshopIndex.find('ButtonToolbar Button').length).to.equal(
          buttons.length
        );
        expect(
          workshopIndex.find('ButtonToolbar Button').map(button => {
            return button.children().first().text();
          })
        ).to.deep.equal(buttons);
      });
    });
  });

  it('defaults to ordering by date descending for In Progress and Past workshops', () => {
    const permission = new Permission([WorkshopAdmin]);
    const workshopIndex = shallow(<WorkshopIndex permission={permission} />, {
      context,
    });

    expect(workshopIndex.find('h2').at(0).text()).to.equal('In Progress');
    expect(
      workshopIndex.find('ServerSortWorkshopTable').at(0).props().initialOrderBy
    ).to.equal('date desc');

    expect(workshopIndex.find('h2').at(2).text()).to.equal('Past');
    expect(
      workshopIndex.find('ServerSortWorkshopTable').at(2).props().initialOrderBy
    ).to.equal('date desc');
  });

  it('defaults to ordering by date ascending for Not Started workshops', () => {
    const permission = new Permission([WorkshopAdmin]);
    const workshopIndex = shallow(<WorkshopIndex permission={permission} />, {
      context,
    });

    expect(workshopIndex.find('h2').at(1).text()).to.equal('Not Started');
    expect(
      workshopIndex.find('ServerSortWorkshopTable').at(1).props().initialOrderBy
    ).to.equal('date asc');
  });
});
