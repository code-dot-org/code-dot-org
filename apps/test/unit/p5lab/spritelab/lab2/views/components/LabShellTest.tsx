import {render, screen} from '@testing-library/react';
import React from 'react';

import LabShell from '@cdo/apps/p5lab/spritelab/lab2/views/components/LabShell';

describe('LabShell', () => {
  it('wraps its content', () => {
    render(<LabShell>body</LabShell>);
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});
