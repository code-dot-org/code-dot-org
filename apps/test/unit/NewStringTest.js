import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {NewString} from '@cdo/apps/NewString';
import i18n from '@cdo/locale';

describe('newString test', function () {
  it('returns "New String"', function () {
    expect(i18n.newString()).toBe('New String');
  });

  it('renders the component with "New String"', function () {
    render(<NewString />);
    expect(screen.getByText('New String')).toBeInTheDocument();
  });
});
