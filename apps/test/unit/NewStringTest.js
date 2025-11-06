import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {NewString} from '@cdo/apps/NewString';
import i18n from '@cdo/locale';

describe('newString test', function () {
  it('returns "New String for Dave"', function () {
    expect(i18n.newStringForDave()).toBe('New String for Dave');
  });

  it('renders the component with "New String for Dave"', function () {
    render(<NewString />);
    expect(screen.getByText('New String for Dave')).toBeInTheDocument();
  });
});
