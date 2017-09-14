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
    it("Facilitators have two buttons", () => {
      new Permission().setPermission('facilitator');

      let workshopIndex = shallow(
        <WorkshopIndex/>, {context}
      );

      expect(workshopIndex.find('ButtonToolbar Button').length).to.equal(2);
      expect(workshopIndex.find('ButtonToolbar Button').map((button) => {
        return button.children().first().text();
      })).to.deep.equal(['Facilitator Survey Results', 'Filter View']);
    });

    it("Organizers and admins have three buttons", () => {
      ['workshop_organizer', 'workshop_admin'].forEach((permission) => {
        new Permission().setPermission(permission);

        let workshopIndex = shallow(
          <WorkshopIndex/>, {context}
        );

        expect(workshopIndex.find('ButtonToolbar Button').length).to.equal(3);
        expect(workshopIndex.find('ButtonToolbar Button').map((button) => {
          return button.children().first().text();
        })).to.deep.equal(['New Workshop', 'Attendance Reports', 'Filter View']);
      });
    });
  });
});
