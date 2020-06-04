import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';

describe('LibraryListItem', () => {
  it('displays no buttons if there are no action props', () => {
    const wrapper = shallow(<LibraryListItem library={{}} />);
    expect(wrapper.find('button')).to.be.empty;
  });

  it('displays three buttons if all action props are set', () => {
    const wrapper = shallow(
      <LibraryListItem
        library={{}}
        onUpdate={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
      />
    );
    expect(wrapper.find('button')).to.have.lengthOf(3);
  });
});
