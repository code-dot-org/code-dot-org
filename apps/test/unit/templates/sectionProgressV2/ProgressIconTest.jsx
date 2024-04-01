import {render, screen} from '@testing-library/react';
import React from 'react';

import {ITEM_TYPE} from '@cdo/apps/templates/sectionProgressV2/ItemType';
import ProgressIcon, {
  PROGRESS_ICON_TITLE_PREFIX,
} from '@cdo/apps/templates/sectionProgressV2/ProgressIcon';

import {expect} from '../../../util/reconfiguredChai';

describe('ProgressIconComponent', () => {
  it('renders the FontAwesome icon for a specific itemType represented with a FontAwesomeIcon', () => {
    const testType = ITEM_TYPE.VALIDATED;
    render(<ProgressIcon itemType={testType} />);

    const iconElement = screen.getByLabelText(
      new RegExp(`^${PROGRESS_ICON_TITLE_PREFIX}${testType[0]}$`)
    );
    expect(iconElement).to.be.visible;
  });

  it('renders the feedback given triangle when itemType is FEEDBACK_GIVEN', () => {
    render(<ProgressIcon itemType={ITEM_TYPE.FEEDBACK_GIVEN} />);
    const feedbackGivenTriangle = screen.getByTestId('feedback-given-triangle');
    expect(feedbackGivenTriangle).to.be.visible;
  });

  it('renders the feedback needed triangle when itemType is NEEDS_FEEDBACK', () => {
    render(<ProgressIcon itemType={ITEM_TYPE.NEEDS_FEEDBACK} />);
    const feedbackGivenTriangle = screen.getByTestId('needs-feedback-triangle');
    expect(feedbackGivenTriangle).to.be.visible;
  });
});
