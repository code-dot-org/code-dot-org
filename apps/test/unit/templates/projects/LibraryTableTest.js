import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {stubFakeProjectLibraryData} from '@cdo/apps/templates/projects/generateFakeProjects';
import {UnconnectedLibraryTable as LibraryTable} from '@cdo/apps/templates/projects/LibraryTable';

const DEFAULT_PROPS = {
  personalProjectsList: [],
  unpublishProjectLibrary: () => {},
};

describe('LibraryTable', () => {
  it('renders null if personalProjectsList is falsy', () => {
    const wrapper = shallow(
      <LibraryTable {...DEFAULT_PROPS} personalProjectsList={null} />
    );
    expect(wrapper.html()).toBeNull();
  });

  it('renders a message if there are no libraries', () => {
    let wrapper = shallow(<LibraryTable {...DEFAULT_PROPS} />);
    expect(wrapper.text()).toBe('You currently have no libraries.');

    // Project that does not have a libraryName
    const project = {channel: 'abc123', name: 'My Project'};
    wrapper = shallow(
      <LibraryTable {...DEFAULT_PROPS} personalProjectsList={[project]} />
    );
    expect(wrapper.text()).toBe('You currently have no libraries.');
  });

  it('renders a table if there are libraries', () => {
    const wrapper = shallow(
      <LibraryTable
        {...DEFAULT_PROPS}
        personalProjectsList={stubFakeProjectLibraryData}
      />
    );
    // Reactabular's Table.Provider renders as Provider
    expect(wrapper.find('Provider').exists()).toBe(true);
  });

  it('renders a dialog if unpublishFailedLibrary is truthy', () => {
    const projectLibraries = [...stubFakeProjectLibraryData];
    const wrapper = shallow(
      <LibraryTable
        {...DEFAULT_PROPS}
        personalProjectsList={projectLibraries}
      />
    );
    wrapper.setState({unpublishFailedChannel: projectLibraries[0].channel});
    expect(wrapper.find('BaseDialog').exists()).toBe(true);
  });
});
