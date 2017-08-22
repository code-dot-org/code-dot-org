import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {throwOnConsoleWarnings} from '../../../util/testUtils';
import {
  UnconnectedOwnedSections as OwnedSections
} from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import Button from '@cdo/apps/templates/Button';
import RosterDialog from "@cdo/apps/templates/teacherDashboard/RosterDialog";
import AddSectionDialog from "@cdo/apps/templates/teacherDashboard/AddSectionDialog";
import EditSectionDialog from "@cdo/apps/templates/teacherDashboard/EditSectionDialog";
import SectionTable from '@cdo/apps/templates/teacherDashboard/SectionTable';
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';

const defaultProps = {
  numSections: 3,
  asyncLoadComplete: true,
  beginEditingNewSection: () => {},
  beginEditingSection: () => {},
  beginImportRosterFlow: () => {},
};

describe('OwnedSections', () => {
  throwOnConsoleWarnings();

  it('renders SetUpSections when no sections have been created', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        numSections={0}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <SetUpSections/>
        <RosterDialog/>
        <AddSectionDialog/>
        <EditSectionDialog/>
      </div>
    );
  });

  it('renders SectionTable when there are sections', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        numSections={3}
      />
    );
    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <Button
            text="New section"
            onClick={instance.addSection}
          />
          <SectionTable onEdit={instance.handleEditRequest}/>
        </div>
        <RosterDialog/>
        <AddSectionDialog/>
        <EditSectionDialog/>
      </div>
    );
  });
});
