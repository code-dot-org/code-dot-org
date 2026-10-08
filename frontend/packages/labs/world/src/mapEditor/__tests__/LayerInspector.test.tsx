// A layer's two slots, and the way to a backdrop the project has not got
// (specs/LOOK_PLAN.md).

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

/** The lab's backdrop library, answered by whatever a test says. */
let imported: string | undefined;
const requestAppearanceImport = vi.fn((kind: string) =>
  Promise.resolve(kind ? imported : undefined),
);
vi.mock('../../appearance/appearanceImport', () => ({
  requestAppearanceImport: (kind: string) => requestAppearanceImport(kind),
}));

const {LayerInspector} = await import('../LayerInspector');
const {IMPORT_SLOT} = await import('../BackgroundField');

const inspector = (
  backgrounds: string[],
  onBackground: (change: object) => void,
) => (
  <LayerInspector
    layer={{id: 'main'}}
    backgrounds={backgrounds}
    onChange={vi.fn()}
    onBackground={onBackground}
    onClose={vi.fn()}
    isReadOnly={false}
  />
);

const mount = (backgrounds: string[] = ['sky.png']) => {
  const onBackground = vi.fn();
  const {rerender} = render(inspector(backgrounds, onBackground));
  const pick = (value: string) =>
    fireEvent.change(screen.getByRole('combobox', {name: 'Background'}), {
      target: {value},
    });
  return {onBackground, pick, rerender};
};

describe('a layer’s background', () => {
  it('offers what the project holds, and a way to more', () => {
    mount();
    const options = [
      ...screen.getByRole('combobox', {name: 'Background'}).children,
    ].map(option => (option as HTMLOptionElement).value);
    expect(options).toEqual(['', 'sky.png', IMPORT_SLOT]);
  });

  it('takes a file the project holds straight away', () => {
    const {onBackground, pick} = mount();
    pick('sky.png');
    expect(onBackground).toHaveBeenCalledWith({sprite: 'sky.png'});
    expect(requestAppearanceImport).not.toHaveBeenCalled();
  });

  it('asks the lab for one it has not, and takes it once the project has it', async () => {
    // The import answers before any editor has rendered with the new file,
    // and a save made then is built on the project without it — which undid
    // the import (`useAfterImport`). So the choice waits for the render whose
    // options hold the file, and goes through THAT render's callback.
    imported = 'cave.png';
    const {onBackground, pick, rerender} = mount();
    pick(IMPORT_SLOT);
    expect(requestAppearanceImport).toHaveBeenCalledWith('background');
    await Promise.resolve();
    await Promise.resolve();
    expect(onBackground).not.toHaveBeenCalled();

    const current = vi.fn();
    rerender(inspector(['cave.png', 'sky.png'], current));
    await vi.waitFor(() =>
      expect(current).toHaveBeenCalledWith({sprite: 'cave.png'}),
    );
    expect(onBackground).not.toHaveBeenCalled();
  });

  it('changes nothing when the learner backs out of the library', async () => {
    imported = undefined;
    const {onBackground, pick} = mount();
    pick(IMPORT_SLOT);
    await Promise.resolve();
    expect(onBackground).not.toHaveBeenCalled();
  });
});
