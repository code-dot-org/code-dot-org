import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render, screen} from '@testing-library/react';
import React from 'react';

import ImageDetailsDialog from '@cdo/apps/p5lab/spritelab/lab2/views/ImageDetailsDialog';

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
