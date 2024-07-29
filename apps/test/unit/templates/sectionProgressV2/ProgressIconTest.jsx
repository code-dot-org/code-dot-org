import {render, screen} from '@testing-library/react';
import React from 'react';

import {ITEM_TYPE} from '@cdo/apps/templates/sectionProgressV2/ItemType';
import ProgressIcon from '@cdo/apps/templates/sectionProgressV2/ProgressIcon';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('ProgressIconComponent', () => {
  it('renders the FontAwesome icon for a specific itemType represented with a FontAwesomeIcon', () => {
    const testTypes = [
      ITEM_TYPE.ASSESSMENT_LEVEL,
      ITEM_TYPE.CHOICE_LEVEL,
      ITEM_TYPE.KEEP_WORKING,
      ITEM_TYPE.NO_ONLINE_WORK,
      ITEM_TYPE.IN_PROGRESS,
      ITEM_TYPE.SUBMITTED,
      ITEM_TYPE.VALIDATED,
    ];

    testTypes.forEach(testType => {
      render(<ProgressIcon itemType={testType} />);

      const iconElement = screen.getByLabelText(testType.title);
      expect(iconElement).to.be.visible;
    });
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
