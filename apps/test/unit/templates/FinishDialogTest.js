import React from 'react';
import color from '@cdo/apps/util/color';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import {UnconnectedFinishDialog as FinishDialog} from '@cdo/apps/templates/FinishDialog';

describe('FinishDialog', () => {
  it('renders', () => {
    const result = shallow(
      <FinishDialog
        isOpen
        isPerfect
        showFunometer
      />
    );
    expect(result.find('div.uitest-bubble').props().style.backgroundColor).to.equal(color.white);
    expect(result.find('PuzzleRatingButtons')).to.have.length(1);
  });
});
