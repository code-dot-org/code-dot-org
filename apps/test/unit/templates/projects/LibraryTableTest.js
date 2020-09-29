import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedLibraryTable as LibraryTable} from '@cdo/apps/templates/projects/LibraryTable';
import {stubFakeProjectLibraryData} from '@cdo/apps/templates/projects/generateFakeProjects';

const DEFAULT_PROPS = {
  personalProjectsList: [],
  unpublishProjectLibrary: () => {}
};

describe('LibraryTable', () => {
  it('renders null if personalProjectsList is falsy', () => {
    const wrapper = shallow(
      <LibraryTable {...DEFAULT_PROPS} personalProjectsList={null} />
    );
    expect(wrapper.html()).to.be.null;
  });

  it('renders a message if there are no libraries', () => {
    let wrapper = shallow(<LibraryTable {...DEFAULT_PROPS} />);
    expect(wrapper.text()).to.equal('You currently have no libraries.');

    // Project that does not have a libraryName
    const project = {channel: 'abc123', name: 'My Project'};
    wrapper = shallow(
      <LibraryTable {...DEFAULT_PROPS} personalProjectsList={[project]} />
    );
    expect(wrapper.text()).to.equal('You currently have no libraries.');
  });

  it('renders a table if there are libraries', () => {
    const wrapper = shallow(
      <LibraryTable
        {...DEFAULT_PROPS}
        personalProjectsList={stubFakeProjectLibraryData}
      />
    );
    // Reactabular's Table.Provider renders as Provider
    expect(wrapper.find('Provider').exists()).to.be.true;
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
    expect(wrapper.find('BaseDialog').exists()).to.be.true;
  });
});
