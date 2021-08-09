import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';

describe('ResourcesDropdown', () => {
  it('renders non-migrated resources for teacher', () => {
    const wrapper = shallow(
      <ResourcesDropdown
        resources={[
          {
            type: ResourceType.curriculum,
            link: 'https://example.com/a'
          },
          {
            type: ResourceType.vocabulary,
            link: 'https://example.com/b'
          }
        ]}
        useMigratedResources={false}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <DropdownButton
            text={i18n.teacherResources()}
            color={Button.ButtonColor.blue}
          >
            <a href="https://example.com/a">{i18n.curriculum()}</a>
            <a href="https://example.com/b">{i18n.vocabulary()}</a>
          </DropdownButton>
        </div>
      )
    ).to.be.true;
  });

  it('renders migrated resources for teacher', () => {
    const wrapper = shallow(
      <ResourcesDropdown
        migratedResources={[
          {
            key: 'key1',
            name: 'Curriculum',
            url: 'https://example.com/a'
          },
          {
            key: 'key2',
            name: 'Vocabulary',
            url: 'https://example.com/b'
          }
        ]}
        useMigratedResources={true}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <DropdownButton
            text={i18n.teacherResources()}
            color={Button.ButtonColor.blue}
          >
            <a href="https://example.com/a">Curriculum</a>
            <a href="https://example.com/b">Vocabulary</a>
          </DropdownButton>
        </div>
      )
    ).to.be.true;
  });

  it('renders migrated resources for student', () => {
    const wrapper = shallow(
      <ResourcesDropdown
        migratedResources={[
          {
            key: 'key1',
            name: 'Curriculum',
            url: 'https://example.com/a'
          },
          {
            key: 'key2',
            name: 'Vocabulary',
            url: 'https://example.com/b'
          }
        ]}
        useMigratedResources={true}
        studentFacing={true}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <DropdownButton
            text={i18n.studentResources()}
            color={Button.ButtonColor.gray}
          >
            <a href="https://example.com/a">Curriculum</a>
            <a href="https://example.com/b">Vocabulary</a>
          </DropdownButton>
        </div>
      )
    ).to.be.true;
  });
});
