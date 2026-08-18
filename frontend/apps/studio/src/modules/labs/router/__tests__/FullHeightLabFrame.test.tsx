import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FullHeightLabFrame from '../FullHeightLabFrame';

describe('FullHeightLabFrame', () => {
  it('renders its children', () => {
    render(
      <FullHeightLabFrame>
        <div>lab content</div>
      </FullHeightLabFrame>,
    );
    expect(screen.getByText('lab content')).toBeInTheDocument();
  });
});
