import {render, screen} from '@testing-library/react';
import React from 'react';

import IconList from '@cdo/apps/code-studio/components/IconList';

describe('IconList', () => {
  const renderIconList = search =>
    render(<IconList assetChosen={jest.fn()} search={search} />);

  it('treats regular expression characters in the search as literal text', () => {
    expect(() => renderIconList('(')).not.toThrow();
    expect(screen.getByText('No icons found')).toBeInTheDocument();
  });

  it('still finds icons by prefix', () => {
    renderIconList('camera');
    expect(screen.queryByText('No icons found')).not.toBeInTheDocument();
  });
});
