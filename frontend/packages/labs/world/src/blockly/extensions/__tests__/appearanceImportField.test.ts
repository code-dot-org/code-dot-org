// The `(import…)` row of an appearance dropdown.
//
// The row is not a value: choosing it means "go and fetch me one". So the
// validator rejects it (the field keeps what it held), the picker runs, and the
// result is written back when it resolves.
//
// The part worth pinning is what happens between those two moments. The import
// puts a new row in the registry the dropdown reads, and a Blockly dropdown
// caches the options it last built — so a field that takes the value without
// rebuilding that cache ends up right in the generated code and wrong on the
// block, showing "(none)" for a background the game is drawing.

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {
  IMPORT_BACKGROUND_VALUE,
  setAppearanceImportHandler,
} from '../../../appearance/appearanceImport';
import {backgroundImportFieldExtension} from '../appearanceImportField';

/** A stand-in for the dropdown field: records the order it was asked things. */
const fakeField = (inner?: (value: string) => string | null) => {
  const calls: string[] = [];
  let value = '';
  let validator = inner;
  return {
    calls,
    getValue: () => value,
    getValidator: () => validator,
    setValidator: (next: (value: string) => string | null) => {
      validator = next;
    },
    getOptions: (useCache: boolean) => {
      calls.push(`getOptions(${useCache})`);
      return [];
    },
    setValue: (next: string) => {
      calls.push(`setValue(${next})`);
      value = next;
    },
    forceRerender: () => calls.push('forceRerender'),
  };
};

/** Apply the extension to a block holding `field` as BACKGROUND. */
const install = (field: ReturnType<typeof fakeField>, disposed = false) => {
  const block = {
    getField: (name: string) => (name === 'BACKGROUND' ? field : null),
    isDisposed: () => disposed,
  };
  // `defineExtension` returns `{name, extension}`; the function is called with
  // the block as `this`, which is what the real Blockly does.
  (
    backgroundImportFieldExtension as unknown as {
      extension(this: unknown): void;
    }
  ).extension.call(block);
  return field.getValidator() as (value: string) => string | null;
};

beforeEach(() => setAppearanceImportHandler(null));

describe('the background dropdown’s import row', () => {
  it('passes an ordinary value to the validator that was already there', () => {
    const inner = vi.fn((value: string) => value);
    const field = fakeField(inner);
    const validate = install(field);

    expect(validate('cave.png')).toBe('cave.png');
    expect(inner).toHaveBeenCalledWith('cave.png');
  });

  it('rejects the row itself, so the field keeps what it held', () => {
    const field = fakeField();
    const validate = install(field);

    // Null is Blockly's "no", which leaves the previous value in place — the
    // field is never left holding a row that is not a value.
    expect(validate(IMPORT_BACKGROUND_VALUE)).toBeNull();
  });

  it('rebuilds the option cache before the imported value lands', async () => {
    const field = fakeField();
    const validate = install(field);
    setAppearanceImportHandler(async () => 'cave.png');

    validate(IMPORT_BACKGROUND_VALUE);
    await vi.waitFor(() => expect(field.getValue()).toBe('cave.png'));

    // Order is the whole point: options first, then the value.
    expect(field.calls).toEqual([
      'getOptions(false)',
      'setValue(cave.png)',
      'forceRerender',
    ]);
  });

  it('writes nothing when the picker was dismissed', async () => {
    const field = fakeField();
    const validate = install(field);
    setAppearanceImportHandler(async () => undefined);

    validate(IMPORT_BACKGROUND_VALUE);
    await Promise.resolve();

    expect(field.calls).toEqual([]);
  });

  it('writes nothing to a block that is gone', async () => {
    // The picker can outlive the workspace it was opened from.
    const field = fakeField();
    const validate = install(field, true);
    setAppearanceImportHandler(async () => 'cave.png');

    validate(IMPORT_BACKGROUND_VALUE);
    await Promise.resolve();
    await Promise.resolve();

    expect(field.calls).toEqual([]);
  });
});
