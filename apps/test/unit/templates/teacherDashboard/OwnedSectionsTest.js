import React from 'react';
import sinon from 'sinon';
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
  sectionIds: [1,2,3],
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
        sectionIds={[]}
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
        <SectionTable sectionIds={[1,2,3]} onEdit={instance.handleEditRequest}/>
        </div>
        <RosterDialog/>
        <AddSectionDialog/>
        <EditSectionDialog/>
      </div>
    );
  });

  it('calls beginEditingNewSection with no arguments when button is clicked', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        beginEditingNewSection={spy}
      />
    );
    expect(spy).not.to.have.been.called;

    wrapper.find(Button).simulate('click', {fake: 'event'});
    expect(spy).to.have.been.calledOnce;
    expect(spy.firstCall.args).to.be.empty;
  });
});
