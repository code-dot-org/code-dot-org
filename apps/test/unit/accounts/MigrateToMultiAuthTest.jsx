import {render, screen} from '@testing-library/react';
import React from 'react';

import MigrateToMultiAuth from '@cdo/apps/accounts/MigrateToMultiAuth';
import i18n from '@cdo/locale';

describe('MigrateToMultiAuth', () => {
  it('renders a notification banner with the migrate notice, details, and link', () => {
    render(<MigrateToMultiAuth />);

    screen.getByText(i18n.migrateToMultiAuth_notice_v2());
    screen.getByText(i18n.migrateToMultiAuth_details_v2());
    const link = screen.getByRole('link', {
      name: i18n.migrateToMutiAuth_buttonText_v2(),
    });
    expect(link).toHaveAttribute('href', '/users/migrate_to_multi_auth');
  });
});
