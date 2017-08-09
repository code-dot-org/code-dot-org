import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import Button from "@cdo/apps/templates/Button";
import {
  UnconnectedSetUpSections as SetUpSections,
} from '@cdo/apps/templates/studioHomepages/SetUpSections';

describe('SetUpSections', () => {
  it('renders as expected', () => {
    const wrapper = mount(
      <SetUpSections
        isRtl={false}
        beginEditingNewSection={() => {}}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            Set up your classroom
          </div>
          <div>
            Create a new classroom section to start assigning courses and seeing your student progress.
          </div>
        </div>
        <Button
          href={pegasus('/teacher-dashboard#/sections')}
          color={Button.ButtonColor.gray}
          text={'Create a section'}
        />
        <div/>
      </div>
    );
  });

  describe(`(${SECTION_FLOW_2017})`, () => {
    beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, true));
    afterEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));

    it('renders as expected', () => {
      const newSectionHandler = sinon.spy();
      const wrapper = mount(
        <SetUpSections
          isRtl={false}
          beginEditingNewSection={newSectionHandler}
        />
      );
      expect(wrapper).to.containMatchingElement(
        <div>
          <div>
            <div>
              Set up your classroom
            </div>
            <div>
              Create a new classroom section to start assigning courses and seeing your student progress.
            </div>
          </div>
          <Button
            onClick={newSectionHandler}
            color={Button.ButtonColor.gray}
            text={'Create a section'}
          />
          <div/>
        </div>
      );
    });
  });
});
