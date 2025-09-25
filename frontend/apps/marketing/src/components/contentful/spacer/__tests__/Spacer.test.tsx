import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Spacer, {SpacerProps} from './../Spacer';

describe('Spacer', () => {
  const renderSpacer = (props: SpacerProps = {}) =>
    render(<Spacer {...props} />);

  const getSpacer = () => screen.getByRole('presentation');

  it('renders spacer', () => {
    renderSpacer();
    const spacer = getSpacer();
    expect(spacer).toBeVisible();
  });
});
