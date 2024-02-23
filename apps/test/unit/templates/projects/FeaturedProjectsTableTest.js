import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import FeaturedProjectsTable from '@cdo/apps/templates/projects/FeaturedProjectsTable';
import {
  stubFakeActiveFeaturedProjectData,
  stubFakeArchivedFeaturedProjectData,
  stubFakeBookmarkedFeaturedProjectData,
} from '@cdo/apps/templates/projects/generateFakeProjects';
import * as utils from '@cdo/apps/utils';
import {allowConsoleWarnings} from '../../../util/throwOnConsole';

describe('FeaturedProjectsTable', () => {
  allowConsoleWarnings();

  describe('featured project data has loaded', () => {
    sinon.stub(utils, 'tryGetLocalStorage');
    it('renders project rows in featured_at order descending', () => {
      const wrapper = mount(
        <FeaturedProjectsTable
          activeList={stubFakeActiveFeaturedProjectData}
          bookmarkedList={stubFakeBookmarkedFeaturedProjectData}
          archivedList={stubFakeArchivedFeaturedProjectData}
        />
      );
      const fifthRow = wrapper.find('BodyRow').at(4);
      const sixthRow = wrapper.find('BodyRow').at(5);
      const seventhRow = wrapper.find('BodyRow').at(8);
      const eighthRow = wrapper.find('BodyRow').at(9);
      expect(fifthRow.props().rowData.projectName).to.equal(
        'Active Featured Project 1'
      );
      expect(sixthRow.props().rowData.projectName).to.equal(
        'Active Featured Project 2'
      );
      expect(seventhRow.props().rowData.projectName).to.equal(
        'Archived Featured Project 1'
      );
      expect(eighthRow.props().rowData.projectName).to.equal(
        'Archived Featured Project 2'
      );
    });
  });
});
