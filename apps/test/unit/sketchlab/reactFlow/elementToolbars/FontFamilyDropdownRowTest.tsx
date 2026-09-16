import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import FontFamilyDropdownRow from '@cdo/apps/sketchlab/reactFlow/elementToolbars/sections/FontFamilyDropdownRow';
import {FontFamilyValue} from '@cdo/apps/sketchlab/reactFlow/elementToolbars/toolbarPalettes';

interface RenderOptions {
  value?: FontFamilyValue;
  onSelect?: (next: FontFamilyValue) => void;
}

function renderRow({value = 'sans', onSelect = jest.fn()}: RenderOptions = {}) {
  return render(
    <ThemeProvider>
      <FontFamilyDropdownRow value={value} onSelect={onSelect} />
    </ThemeProvider>
  );
}

function openPopover() {
  fireEvent.click(screen.getByRole('button'));
}

describe('FontFamilyDropdownRow', () => {
  it('shows the selected category on the trigger', () => {
    renderRow({value: 'serif'});
    expect(screen.getByRole('button')).toHaveTextContent('Serif');
  });

  it('lists every font category in the popover', () => {
    renderRow();
    openPopover();
    for (const label of ['Sans', 'Monospace', 'Serif', 'Cursive', 'Draw']) {
      expect(screen.getByRole('menuitem', {name: label})).toBeInTheDocument();
    }
  });

  it('reports the chosen category key on select', () => {
    const onSelect = jest.fn();
    renderRow({value: 'sans', onSelect});
    openPopover();
    fireEvent.click(screen.getByRole('menuitem', {name: 'Monospace'}));
    expect(onSelect).toHaveBeenCalledWith('monospace');
  });

  it('renders each option in its own typeface as a preview', () => {
    renderRow();
    openPopover();
    expect(screen.getByRole('menuitem', {name: 'Monospace'})).toHaveTextContent(
      'Monospace'
    );
    // The label span carries the font stack inline so the menu previews it.
    const monospaceLabel = screen.getByText('Monospace');
    expect(monospaceLabel).toHaveStyle({
      fontFamily: "'Courier New', Consolas, 'DejaVu Sans Mono', monospace",
    });
  });
});
