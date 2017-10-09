import WorkshopIndex from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_index';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Permission from '@cdo/apps/code-studio/pd/permission';

describe("WorkshopIndex", () => {
  const fakeRouter = {
    createHref() {}
  };
  const context = {
    router: fakeRouter
  };

  beforeEach(() => {
    sinon.mock(fakeRouter);
  });

  describe("Button counts", () => {
    // map each user permission that utilizes the Workshop Dashboard
    // to the list of buttons to which it has access
    let permissionButtonMap = new Map([
      [
        "facilitator",
        [
          "Facilitator Survey Results",
          "Filter View"
        ]
      ],
      [
        "workshop_organizer",
        [
          "New Workshop",
          "Attendance Reports",
          "Filter View"
        ]
      ],
      [
        "workshop_admin",
        [
          "New Workshop",
          "Attendance Reports",
          "User Management",
          "Filter View"
        ]
      ]
    ]);

    permissionButtonMap.forEach(function (buttons, permission) {
      it(permission + " has " + buttons.length + " buttons", () => {
        new Permission().setPermission(permission);

        let workshopIndex = shallow(
            <WorkshopIndex/>, {context}
        );

        expect(workshopIndex.find('ButtonToolbar Button').length).to.equal(buttons.length);
        expect(workshopIndex.find('ButtonToolbar Button').map((button) => {
            return button.children().first().text();
        })).to.deep.equal(buttons);
      });
    });
  });
});
