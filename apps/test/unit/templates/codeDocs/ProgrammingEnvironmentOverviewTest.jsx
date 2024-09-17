import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ProgrammingEnvironmentOverview, {
  CategorySection,
} from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentOverview';

describe('ProgrammingEnvironmentOverview', () => {
  let defaultProgrammingEnvironment;

  beforeEach(() => {
    defaultProgrammingEnvironment = {
      title: 'Sprite Lab',
      description: 'spritelab description',
      projectUrl: '/p/spritelab',
      categories: [
        {
          key: 'world',
          name: 'World',
          color: '#acacd2',
          docs: [],
        },
        {
          key: 'sprites',
          name: 'Sprites',
          color: '#df9299',
          docs: [],
        },
      ],
    };
  });

  it('renders a category section for each category', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentOverview
        programmingEnvironment={defaultProgrammingEnvironment}
      />
    );
    expect(wrapper.find('CategorySection').length).toBe(2);
    expect(
      wrapper.find('CategorySection').map(cat => cat.props().category.name)
    ).toEqual(['World', 'Sprites']);
  });

  it('renders description if provided', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentOverview
        programmingEnvironment={defaultProgrammingEnvironment}
      />
    );
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(1);
    expect(wrapper.find('EnhancedSafeMarkdown').first().props().markdown).toBe(
      'spritelab description'
    );
    expect(wrapper.find('TextLink').props().href).toBe('/p/spritelab');
  });

  it('doesnt render description if not provided', () => {
    delete defaultProgrammingEnvironment.description;
    delete defaultProgrammingEnvironment.projectUrl;
    const wrapper = shallow(
      <ProgrammingEnvironmentOverview
        programmingEnvironment={defaultProgrammingEnvironment}
      />
    );
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(0);
    expect(wrapper.find('a').length).toBe(0);
  });
});

describe('CategorySection', () => {
  it('renders CategorySection', () => {
    const wrapper = shallow(
      <CategorySection
        category={{
          key: 'world',
          name: 'World',
          color: '#FFFFFF',
          docs: [
            {
              key: 'location_picker',
            },
            {
              key: 'set_background',
            },
          ],
        }}
      />
    );
    expect(wrapper.text().includes('World')).toBe(true);
    expect(wrapper.find('CodeDocLink').length).toBe(2);
  });
});
