import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from '../../../util/configuredChai';
import {
  throwOnConsoleErrors, throwOnConsoleWarnings
} from '../../../util/testUtils';
import i18n from '@cdo/locale';
import {
  UnconnectedOwnedSections as OwnedSections
} from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import Button from '@cdo/apps/templates/Button';
import RosterDialog from "@cdo/apps/templates/teacherDashboard/RosterDialog";
import AddSectionDialog from "@cdo/apps/templates/teacherDashboard/AddSectionDialog";
import EditSectionDialog from "@cdo/apps/templates/teacherDashboard/EditSectionDialog";
import SectionTable from '@cdo/apps/templates/teacherDashboard/SectionTable';
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';

const defaultProps = {
  numSections: 3,
  classrooms: null,
  studioUrl: '',
  asyncLoadComplete: true,
  newSection: () => {},
  loadClassroomList: () => {},
  importClassroomStarted: () => {},
  beginEditingNewSection: () => {},
  beginEditingSection: () => {},
  asyncLoadSectionData: () => {},
};

describe('OwnedSections', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));

  it('renders jumbotron when no sections have been created', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        numSections={0}
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
          <div className="jumbotron">
            <p>
              {i18n.createSectionsInfo()}
            </p>
          </div>
        </div>
        <RosterDialog
          isOpen={false}
          studioUrl={defaultProps.studioUrl}
        />
        <AddSectionDialog handleImportOpen={defaultProps.handleImportOpen}/>
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
        <RosterDialog
          isOpen={false}
          studioUrl={defaultProps.studioUrl}
        />
        <AddSectionDialog handleImportOpen={defaultProps.handleImportOpen}/>
        <EditSectionDialog/>
      </div>
    );
  });

  it('provides default course id when creating new section', () => {
    const newSectionFunction = sinon.spy();
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        defaultCourseId={30}
        defaultScriptId={112}
        newSection={newSectionFunction}
      />
    );

    const newSectionButton = wrapper.find('Button').first();
    newSectionButton.simulate('click');
    assert.deepEqual(newSectionFunction.firstCall.args, [30]);
  });

  describe(`(${SECTION_FLOW_2017})`, () => {
    beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, true));
    afterEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));

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
          <RosterDialog
            isOpen={false}
            studioUrl={defaultProps.studioUrl}
          />
          <AddSectionDialog handleImportOpen={defaultProps.handleImportOpen}/>
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
          <RosterDialog
            isOpen={false}
            studioUrl={defaultProps.studioUrl}
          />
          <AddSectionDialog handleImportOpen={defaultProps.handleImportOpen}/>
          <EditSectionDialog/>
        </div>
      );
    });

    it('provides default courseId and scriptId when creating new section', () => {
      const newSectionFunction = sinon.spy();
      const wrapper = shallow(
        <OwnedSections
          {...defaultProps}
          defaultCourseId={30}
          defaultScriptId={112}
          beginEditingNewSection={newSectionFunction}
        />
      );

      const newSectionButton = wrapper.find('Button').first();
      newSectionButton.simulate('click');
      assert.deepEqual(newSectionFunction.firstCall.args, [30, 112]);
    });
  });
});
