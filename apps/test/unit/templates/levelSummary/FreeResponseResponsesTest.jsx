import {render, screen} from '@testing-library/react';
import React from 'react';

import DCDO from '@cdo/apps/dcdo';
import FreeResponseResponses from '@cdo/apps/templates/levelSummary/FreeResponseResponses';

const RESPONSES = [
  {user_id: 0, text: 'student response 1'},
  {user_id: 1, text: 'student response 2'},
  {user_id: 3, text: 'student response 3'},
  {user_id: 2, text: 'student response 4'},
  {user_id: 9, text: 'student response 5'},
];
const DEFAULT_PROPS = {
  responses: RESPONSES,
};

describe('FreeResponseResponses', () => {
  const renderDefault = (propOverrides = {}) => {
    const props = {...DEFAULT_PROPS, ...propOverrides};
    return render(<FreeResponseResponses {...props} />);
  };

  it('renders responses', () => {
    DCDO.set('cfu-pin-hide-enabled', true);
    renderDefault();

    expect(screen.getAllByText(/student response [1-5]/)).toHaveLength(
      RESPONSES.length
    );
  });

  it('hides responses', () => {
    DCDO.set('cfu-pin-hide-enabled', true);
    renderDefault();

    screen.getByText('student response 1');

    const dropdownButton = screen.getAllByTitle('Additional options')[0];

    dropdownButton.click();

    const hideResponseButton = screen.getByRole('button', {
      name: 'Hide response',
    });
    hideResponseButton.click();

    expect(screen.queryByText('student response 1')).toBeNull();

    const showAllResponsesButton = screen.getByText('Show hidden responses');
    showAllResponsesButton.click();

    screen.getByText('student response 1');
  });
});
