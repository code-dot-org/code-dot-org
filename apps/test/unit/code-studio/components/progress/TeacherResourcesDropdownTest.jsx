import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import TeacherResourcesDropdown from '@cdo/apps/code-studio/components/progress/TeacherResourcesDropdown';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';

describe('TeacherResourcesDropdown', () => {
  it('renders resources for teacher', () => {
    const wrapper = shallow(
      <TeacherResourcesDropdown
        resources={[
          {
            type: 'Curriculum',
            link: 'https://example.com/a'
          },
          {
            type: 'Vocabulary',
            link: 'https://example.com/b'
          }
        ]}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <DropdownButton
            text={i18n.teacherResources()}
            color={Button.ButtonColor.blue}
          >
            <a href="https://example.com/a" target="_blank">
              {i18n.curriculum()}
            </a>
            <a href="https://example.com/b" target="_blank">
              {i18n.vocabulary()}
            </a>
          </DropdownButton>
        </div>
      )
    ).to.be.true;
  });
});
