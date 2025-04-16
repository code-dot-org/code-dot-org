import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Spacer, {SpacerProps} from './../Spacer';

describe('Spacer', () => {
  const title = 'Spacer';

  const renderSpacer = (props: SpacerProps = {}) =>
    render(<Spacer {...props} title={title} />);

  const getSpacer = () => screen.getByTitle(title);

  it('renders spacer', () => {
    renderSpacer();
    const spacer = getSpacer();
    expect(spacer).toBeVisible();
  });
});
