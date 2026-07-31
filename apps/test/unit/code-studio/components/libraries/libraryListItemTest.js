import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';

describe('LibraryListItem', () => {
  it('displays no buttons if there are no action props', () => {
    const wrapper = shallow(<LibraryListItem library={{}} />);
    expect(wrapper.find(MuiIconButton)).toHaveLength(0);
    expect(wrapper.find(MuiButton)).toHaveLength(0);
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
    // add + remove are icon buttons, update is a text+icon button
    expect(wrapper.find(MuiIconButton)).toHaveLength(2);
    expect(wrapper.find(MuiButton)).toHaveLength(1);
  });
});
