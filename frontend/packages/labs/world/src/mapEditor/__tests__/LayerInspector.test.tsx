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

const mount = (backgrounds: string[] = ['sky.png']) => {
  const onBackground = vi.fn();
  render(
    <LayerInspector
      layer={{id: 'main'}}
      backgrounds={backgrounds}
      onChange={vi.fn()}
      onBackground={onBackground}
      onClose={vi.fn()}
      isReadOnly={false}
    />,
  );
  const pick = (value: string) =>
    fireEvent.change(screen.getByRole('combobox', {name: 'Background'}), {
      target: {value},
    });
  return {onBackground, pick};
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

  it('asks the lab for one it has not, and takes what comes back', async () => {
    imported = 'cave.png';
    const {onBackground, pick} = mount();
    pick(IMPORT_SLOT);
    expect(requestAppearanceImport).toHaveBeenCalledWith('background');
    await vi.waitFor(() =>
      expect(onBackground).toHaveBeenCalledWith({sprite: 'cave.png'}),
    );
  });

  it('changes nothing when the learner backs out of the library', async () => {
    imported = undefined;
    const {onBackground, pick} = mount();
    pick(IMPORT_SLOT);
    await Promise.resolve();
    expect(onBackground).not.toHaveBeenCalled();
  });
});
