// Just enough of a Blockly block and generator for lab block generators.
export const fakeBlock = (
  fields: Record<string, string> = {},
  extra: Record<string, unknown> = {}
) =>
  ({
    getFieldValue: (name: string) => fields[name],
    getNextBlock: () => null,
    ...extra,
  } as never);

export const fakeGenerator = (values: Record<string, string> = {}) =>
  ({
    valueToCode: (_block: unknown, name: string) => values[name] || '',
    blockToCode: () => 'say();\n',
    prefixLines: (text: string, prefix: string) =>
      text.replace(/^(?=.)/gm, prefix),
  } as never);
