import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';

import MarkdownInstructions from '@cdo/apps/templates/instructions/MarkdownInstructions';

import {setExternalGlobals} from '../../../util/testUtils';

describe('MarkdownInstructions', function () {
  setExternalGlobals();

  const mockStore = configureMockStore();

  const renderWithStore = ui => {
    const store = mockStore({});
    return render(<Provider store={store}>{ui}</Provider>);
  };

  it('renders markdown content in the standard case', function () {
    renderWithStore(
      <MarkdownInstructions
        markdown="md"
        markdownClassicMargins={false}
        inTopPane={false}
        noInstructionsWhenCollapsed={true}
      />
    );

    expect(screen.getByText('md')).toBeInTheDocument();
  });

  it('renders markdown when displayed in the top pane', function () {
    renderWithStore(
      <MarkdownInstructions
        markdown="md"
        inTopPane={true}
        noInstructionsWhenCollapsed={true}
      />
    );

    const markdownText = screen.getByText('md');
    const wrapper = markdownText.closest('.instructions-markdown');
    expect(wrapper).not.toBeNull();
  });
});
