import {render, screen} from '@testing-library/react';
import React from 'react';

import MigrateToMultiAuth from '@cdo/apps/accounts/MigrateToMultiAuth';
import i18n from '@cdo/locale';

describe('MigrateToMultiAuth', () => {
  it('renders an alert with the migrate notice and link', () => {
    render(<MigrateToMultiAuth />);

    screen.getByText(i18n.migrateToMultiAuth_notice_v2());
    const link = screen.getByRole('link', {
      name: i18n.migrateToMutiAuth_buttonText_v2(),
    });
    expect(link).toHaveAttribute('href', '/users/migrate_to_multi_auth');
  });
});
