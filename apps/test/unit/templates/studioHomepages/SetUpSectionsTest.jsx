import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import Button from "@cdo/apps/templates/Button";
import {
  UnconnectedSetUpSections as SetUpSections,
} from '@cdo/apps/templates/studioHomepages/SetUpSections';

describe('SetUpSections', () => {
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
