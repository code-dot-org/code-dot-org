import {render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import UnconnectedProgressFeedbackBanner from '@cdo/apps/templates/sectionProgressV2/ProgressFeedbackBanner';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

describe('UnconnectedProgressFeedbackBanner', () => {
  it('renders correctly with initial state', () => {
    const fakeFetch = sinon.spy();
    const fakeCreate = sinon.spy();
    const props = {
      canShow: false,
      isLoading: false,
      progressV2Feedback: null,
      fetchProgressV2Feedback: fakeFetch,
      createProgressV2Feedback: fakeCreate,
      errorWhenCreatingOrLoading: null,
    };

    render(<UnconnectedProgressFeedbackBanner {...props} />);
    expect(screen.getByText(i18n.progressV2_feedback_question())).not.be
      .visible;
  });

  //   it('handles answer function when thumbs up is clicked', () => {
  //     const createFeedbackMock = jest.fn();
  //     const props = {
  //       canShow: true,
  //       isLoading: false,
  //       progressV2Feedback: {empty: true},
  //       fetchProgressV2Feedback: jest.fn(),
  //       createProgressV2Feedback: createFeedbackMock,
  //       errorWhenCreatingOrLoading: null,
  //     };

  //     const {getByText} = render(
  //       <UnconnectedProgressFeedbackBanner {...props} />
  //     );
  //     fireEvent.click(getByText(/Thumbs Up/i));
  //     expect(createFeedbackMock).toHaveBeenCalled();
  //   });
});
