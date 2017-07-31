import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {assert} from '../../../util/configuredChai';
import {
  CoursesSetUpMessage,
  UnconnectedSectionsSetUpMessage as SectionsSetUpMessage,
} from '@cdo/apps/templates/studioHomepages/SetUpMessage';
import Button from "@cdo/apps/templates/Button";
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';

describe('CoursesSetUpMessage', () => {
  it('renders as expected for a teacher', () => {
    const wrapper = mount(
      <CoursesSetUpMessage isRtl={false} isTeacher={true}/>
    );
    assert(wrapper.containsMatchingElement(
      <div>
        <div>
          Start learning
        </div>
        <div>
          Assign a course to your classroom or start your own course.
        </div>
        <Button
          href={'/courses'}
          color={Button.ButtonColor.gray}
          text={'Find a course'}
        />
      </div>
    ));
  });

  it('renders as expected for a student', () => {
    const wrapper = mount(
      <CoursesSetUpMessage isRtl={false} isTeacher={false}/>
    );
    assert(wrapper.containsMatchingElement(
      <div>
        <div>
          Start learning
        </div>
        <div>
          Browse Code.org's courses to find your next challenge.
        </div>
        <Button
          href={'/courses'}
          color={Button.ButtonColor.gray}
          text={'Find a course'}
        />
      </div>
    ));
  });
});

describe('SectionsSetUpMessage', () => {
  it('renders as expected', () => {
    const wrapper = mount(
      <SectionsSetUpMessage
        isRtl={false}
        codeOrgUrlPrefix="http://localhost:3000/"
        beginEditingNewSection={() => {}}
      />
    );
    assert(wrapper.containsMatchingElement(
      <div>
        <div>
          Set up your classroom
        </div>
        <div>
          Create a new classroom section to start assigning courses and seeing your student progress.
        </div>
        <Button
          href={'http://localhost:3000//teacher-dashboard#/sections'}
          color={Button.ButtonColor.gray}
          text={'Create section'}
        />
      </div>
    ));
  });

  describe(`(${SECTION_FLOW_2017})`, () => {
    beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, true));
    afterEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));

    it('renders as expected', () => {
      const newSectionHandler = sinon.spy();
      const wrapper = mount(
        <SectionsSetUpMessage
          isRtl={false}
          codeOrgUrlPrefix="http://localhost:3000/"
          beginEditingNewSection={newSectionHandler}
        />
      );
      assert(wrapper.containsMatchingElement(
        <div>
          <div>
            Set up your classroom
          </div>
          <div>
            Create a new classroom section to start assigning courses and seeing your student progress.
          </div>
          <Button
            onClick={newSectionHandler}
            color={Button.ButtonColor.gray}
            text={'Create section'}
          />
        </div>
      ));
    });
  });
});
