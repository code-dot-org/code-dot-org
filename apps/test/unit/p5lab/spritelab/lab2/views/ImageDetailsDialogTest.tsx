import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render, screen} from '@testing-library/react';
import React from 'react';

import ImageDetailsDialog, {
  resolutionLabel,
} from '@cdo/apps/p5lab/spritelab/lab2/views/ImageDetailsDialog';

// The summary view's primary button reads Accept when this dialog session
// replaced the image it opened on (including starting from nothing), and
// Done when the image is unchanged — the caller derives that; this pins
// what each value shows.

type DialogProps = React.ComponentProps<typeof ImageDetailsDialog>;

function renderDialog(props: Partial<DialogProps> = {}) {
  return render(
    // useTheme throws without a provider.
    <ThemeProvider>
      <ImageDetailsDialog
        animKey="k1"
        name="Sprite 1"
        thumb="data:image/png;base64,"
        onClose={jest.fn()}
        onPaint={jest.fn()}
        onRename={() => null}
        onDelete={jest.fn()}
        getDataURI={async () => null}
        isNameTaken={() => false}
        onAcceptGenerated={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
}

describe('ImageDetailsDialog primary button', () => {
  it('says Done while the image is what the session opened on', () => {
    renderDialog({imageChanged: false});
    expect(screen.getByRole('button', {name: 'Done'})).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Accept'})
    ).not.toBeInTheDocument();
  });

  it('says Accept once the session has replaced the image', () => {
    renderDialog({imageChanged: true});
    expect(screen.getByRole('button', {name: 'Accept'})).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Done'})
    ).not.toBeInTheDocument();
  });
});

describe('ImageDetailsDialog resolution row', () => {
  it('shows the stored size for a smooth image', () => {
    renderDialog({resolution: {x: 512, y: 512}});
    expect(screen.getByText('Resolution')).toBeInTheDocument();
    expect(screen.getByText('512 × 512')).toBeInTheDocument();
  });

  it('leads with the logical size for pixel art, stored in parentheses', () => {
    renderDialog({resolution: {x: 512, y: 512}, pixelGridSize: 8});
    expect(screen.getByText('64 × 64 (512 × 512)')).toBeInTheDocument();
  });

  it('shows the row without generation metadata (painted images)', () => {
    // No generation prop at all: the list holds only the resolution.
    renderDialog({resolution: {x: 256, y: 256}});
    expect(screen.getByText('Resolution')).toBeInTheDocument();
    expect(screen.queryByText('Prompt')).not.toBeInTheDocument();
  });

  it('shows no row without a resolution', () => {
    renderDialog({});
    expect(screen.queryByText('Resolution')).not.toBeInTheDocument();
  });
});

describe('resolutionLabel', () => {
  it('treats a grid of 1 as plain resolution', () => {
    expect(resolutionLabel({x: 64, y: 48}, 1)).toBe('64 × 48');
  });

  it('rounds a non-integral logical size', () => {
    // 520px at 8 physical px per art pixel: the 65x65 witch-era grid.
    expect(resolutionLabel({x: 520, y: 520}, 8)).toBe('65 × 65 (520 × 520)');
  });
});
