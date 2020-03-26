import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LibraryIdImporter from '@cdo/apps/code-studio/components/libraries/LibraryIdImporter';

describe('LibraryIdImporter', () => {
  it('setLibraryToImport sets the import library', () => {
    const wrapper = shallow(<LibraryIdImporter addLibraryById={() => {}} />);
    wrapper.instance().setLibraryToImport({target: {value: 'id'}});
    expect(wrapper.state().importLibraryId).to.equal('id');
  });

  it('setLibraryToImport resets wasClicked to false', () => {
    const wrapper = shallow(<LibraryIdImporter addLibraryById={() => {}} />);
    wrapper.instance().setState({wasClicked: true});
    wrapper.instance().setLibraryToImport({target: {value: 'id'}});
    expect(wrapper.state().wasClicked).to.be.false;
  });
});
