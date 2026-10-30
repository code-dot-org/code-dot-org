import {render, screen} from '@testing-library/react';

import Field from '../Field';

describe('Design System - Field', () => {
  it('renders its children', () => {
    render(
      <Field>
        <input aria-label="Name" />
      </Field>,
    );
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });
});
