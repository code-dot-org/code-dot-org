import {WorkshopIndex} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_index';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Permission, {
  Facilitator,
  CsfFacilitator,
  Organizer,
  ProgramManager,
  WorkshopAdmin
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';

describe('WorkshopIndex', () => {
  const fakeRouter = {
    createHref() {}
  };
  const context = {
    router: fakeRouter
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
        ['New Workshop', 'Legacy Facilitator Survey Summaries', 'Filter View']
      ],
      [Organizer, ['New Workshop', 'Attendance Reports', 'Filter View']],
      [ProgramManager, ['New Workshop', 'Attendance Reports', 'Filter View']],
      [
        WorkshopAdmin,
        [
          'New Workshop',
          'Attendance Reports',
          'Filter View',
          'Export Survey Results'
        ]
      ]
    ]);

    permissionButtonMap.forEach(function(buttons, permissionName) {
      it(permissionName + ' has ' + buttons.length + ' buttons', () => {
        const permission = new Permission([permissionName]);

        let workshopIndex = shallow(<WorkshopIndex permission={permission} />, {
          context
        });

        expect(workshopIndex.find('ButtonToolbar Button').length).to.equal(
          buttons.length
        );
        expect(
          workshopIndex.find('ButtonToolbar Button').map(button => {
            return button
              .children()
              .first()
              .text();
          })
        ).to.deep.equal(buttons);
      });
    });
  });
});
