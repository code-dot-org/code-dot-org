import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import ProgressIcon from '@cdo/apps/templates/sectionProgressV2/ProgressIcon';
import {PROGRESS_ICON_TITLE_PREFIX} from '@cdo/apps/templates/sectionProgressV2/ProgressIcon';
import {ITEM_TYPE} from '@cdo/apps/templates/sectionProgressV2/ItemType';
import color from '@cdo/apps/util/color';

describe('ProgressIcon Component', () => {
  it('renders the FontAwesome icon for a specific itemType represented with a FontAwesomeIcon', () => {
    const testType = ITEM_TYPE.VALIDATED;
    console.log(testType);
    render(<ProgressIcon itemType={testType} />);

    const iconElement = screen.getByTitle(
      new RegExp(`^${PROGRESS_ICON_TITLE_PREFIX}${testType[0]}$`)
    );
    expect(iconElement).to.be.visible;
  });

  it('renders the not started box when itemType is NOT_STARTED', () => {
    render(<ProgressIcon itemType={ITEM_TYPE.NOT_STARTED} />);
    const progressBox = screen.getByTestId('progress-box');
    expect(progressBox).to.be.visible;
  });

  it('renders the viewed box when itemType is VIEWED', () => {
    render(<ProgressIcon itemType={ITEM_TYPE.VIEWED} />);
    const progressBox = screen.getByTestId('progress-box');
    expect(progressBox).to.be.visible;
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
