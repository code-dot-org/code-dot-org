import React from 'react';
import {render, screen} from '@testing-library/react';

import {expect} from '../../util/reconfiguredChai';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

describe('Design System - FontAwesomeV6Icon', () => {
  it('FontAwesomeV6Icon - renders with correct classNames and title', () => {
    render(
      <FontAwesomeV6Icon
        iconStyle="solid"
        iconName="check"
        title="check-icon"
        className="test-class"
      />
    );

    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).to.exist;
    expect(icon.classList.contains('fa-solid')).to.be.true;
    expect(icon.classList.contains('fa-check')).to.be.true;
    expect(icon.classList.contains('test-class')).to.be.true;
    expect(icon.getAttribute('title')).to.equal('check-icon');
  });
});
