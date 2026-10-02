import 'vitest-canvas-mock';
import {render, screen} from '@testing-library/react';
import {type ComponentProps} from 'react';
import {describe, expect, it, vi} from 'vitest';

import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';

import ImageDetailsDialog, {resolutionLabel} from '../ImageDetailsDialog';

vi.mock('../../ai/images/imageGeneration', () => ({generateImage: vi.fn()}));
vi.mock('../../ai/images/characterSet', async importOriginal => ({
  ...(await importOriginal<typeof import('../../ai/images/characterSet')>()),
  generateCharacterSet: vi.fn(),
}));

// The summary view's primary button reads Accept when this dialog session
// replaced the image it opened on (including starting from nothing), and
// Done when the image is unchanged; the caller derives that.

type DialogProps = ComponentProps<typeof ImageDetailsDialog>;

function renderDialog(props: Partial<DialogProps> = {}) {
  return render(
    // useTheme throws without a provider.
    <ThemeProvider>
      <ImageDetailsDialog
        animKey="k1"
        name="Sprite 1"
        thumb="data:image/png;base64,"
        onClose={vi.fn()}
        onPaint={vi.fn()}
        onRename={() => null}
        onDelete={vi.fn()}
        getDataURI={async () => null}
        isNameTaken={() => false}
        onAcceptGenerated={vi.fn()}
        {...props}
      />
    </ThemeProvider>,
  );
}

describe('ImageDetailsDialog primary button', () => {
  it('says Done while the image is what the session opened on', () => {
    renderDialog({imageChanged: false});
    expect(screen.getByRole('button', {name: 'Done'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Accept'})).toBeNull();
  });

  it('says Accept once the session has replaced the image', () => {
    renderDialog({imageChanged: true});
    expect(screen.getByRole('button', {name: 'Accept'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Done'})).toBeNull();
  });
});

describe('ImageDetailsDialog resolution row', () => {
  it('shows the stored size for a smooth image', () => {
    renderDialog({resolution: {x: 512, y: 512}});
    expect(screen.getByText('Resolution')).toBeTruthy();
    expect(screen.getByText('512 × 512')).toBeTruthy();
  });

  it('leads with the logical size for pixel art, stored in parentheses', () => {
    renderDialog({resolution: {x: 512, y: 512}, pixelGridSize: 8});
    expect(screen.getByText('64 × 64 (512 × 512)')).toBeTruthy();
  });

  it('shows the row without generation metadata (painted images)', () => {
    // No generation prop at all: the list holds only the resolution.
    renderDialog({resolution: {x: 256, y: 256}});
    expect(screen.getByText('Resolution')).toBeTruthy();
    expect(screen.queryByText('Prompt')).toBeNull();
  });

  it('shows no row without a resolution', () => {
    renderDialog({});
    expect(screen.queryByText('Resolution')).toBeNull();
  });
});

describe('resolutionLabel', () => {
  it('treats a grid of 1 as plain resolution', () => {
    expect(resolutionLabel({x: 64, y: 48}, 1)).toBe('64 × 48');
  });

  it('rounds a non-integral logical size', () => {
    // 520px at 8 physical px per art pixel: a 65x65 image stored before
    // normalization standardized grid sizes.
    expect(resolutionLabel({x: 520, y: 520}, 8)).toBe('65 × 65 (520 × 520)');
  });
});
