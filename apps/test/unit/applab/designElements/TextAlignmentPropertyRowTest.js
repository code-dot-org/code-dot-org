import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EnumPropertyRow from '@cdo/apps/applab/designElements/EnumPropertyRow';
import TextAlignmentPropertyRow, {
  TEXT_ALIGNMENT_LEFT,
  TEXT_ALIGNMENT_RIGHT,
  TEXT_ALIGNMENT_CENTER,
  TEXT_ALIGNMENT_JUSTIFY,
} from '@cdo/apps/applab/designElements/TextAlignmentPropertyRow';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('TextAlignmentPropertyRow', () => {
  let initialValue;
  let handleChange;
  let wrapper;

  beforeEach(() => {
    initialValue = TEXT_ALIGNMENT_LEFT;
    handleChange = sinon.stub();
    wrapper = shallow(
      <TextAlignmentPropertyRow
        initialValue={initialValue}
        handleChange={handleChange}
      />
    );
  });

  it('renders EnumPropertyRow with correct props', () => {
    const enumPropertyRow = wrapper.find(EnumPropertyRow);

    expect(enumPropertyRow.prop('desc')).to.equal('text alignment');
    expect(enumPropertyRow.prop('initialValue')).to.equal(initialValue);
    expect(enumPropertyRow.prop('options')).to.deep.equal([
      TEXT_ALIGNMENT_LEFT,
      TEXT_ALIGNMENT_RIGHT,
      TEXT_ALIGNMENT_CENTER,
      TEXT_ALIGNMENT_JUSTIFY,
    ]);
    expect(enumPropertyRow.prop('displayOptions')).to.deep.equal([
      'left',
      'right',
      'center',
      'justify',
    ]);
    expect(enumPropertyRow.prop('handleChange')).to.equal(handleChange);
  });

  it('calls handleChange when the value changes', () => {
    const enumPropertyRow = wrapper.find(EnumPropertyRow);
    const newValue = TEXT_ALIGNMENT_CENTER;

    enumPropertyRow.props().handleChange(newValue);

    expect(handleChange).to.have.been.calledOnceWith(newValue);
  });
});
