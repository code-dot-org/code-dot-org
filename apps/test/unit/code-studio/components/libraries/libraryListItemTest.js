import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';

import {expect} from '../../../../util/reconfiguredChai';

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
