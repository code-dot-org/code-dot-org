// @vitest-environment node
// esbuild, which compiles the sheets, does not run under jsdom.
import {readFileSync} from 'node:fs';
import path from 'node:path';
import postcss, {Rule} from 'postcss';
import {preprocessCSS, resolveConfig} from 'vite';

const dialogDir = path.resolve(__dirname, '..');
const variablesFile = path.resolve(
  dialogDir,
  '../../../component-library-styles/variables.scss',
);

const compile = async (fileName: string) => {
  const config = await resolveConfig(
    {
      configFile: false,
      logLevel: 'silent',
      css: {modules: {generateScopedName: '[local]'}},
    },
    'serve',
  );
  const file = path.join(dialogDir, fileName);
  const {code} = await preprocessCSS(readFileSync(file, 'utf8'), file, config);
  const rules: Record<string, Record<string, string>> = {};
  postcss.parse(code).walkRules((rule: Rule) => {
    const declarations = (rules[rule.selector] ??= {});
    rule.walkDecls(decl => {
      declarations[decl.prop] = decl.value;
    });
  });
  return rules;
};

const classCount = (selector: string) =>
  (selector.match(/\.[\w-]+/g) ?? []).length;

describe('MuiCustomDialog styles', () => {
  it('reads the legacy overlay z-index variable, overridable by --cdo-dialog-z-index', async () => {
    const zIndex = readFileSync(variablesFile, 'utf8').match(
      /\$zindex-modal-backdrop:\s*(\d+);/,
    )?.[1];
    const rules = await compile('muiCustomDialog.module.scss');
    const selector = '.customDialogOverlay.MuiDialog-root';

    expect(zIndex).toBeDefined();
    expect(rules[selector]['z-index']).toBe(
      `var(--cdo-dialog-z-index, ${zIndex})`,
    );
    expect(classCount(selector)).toBe(2);
  });

  it('keeps the backdrop black-alpha in both themes, above emotion', async () => {
    const rules = await compile('muiCustomDialog.module.scss');
    const selector = '.customDialogOverlay > .MuiBackdrop-root';

    expect(rules[selector]['background-color']).toBe(
      'var(--neutral-black-alpha-90)',
    );
    expect(classCount(selector)).toBe(2);
  });

  it('matches the legacy panel and close button rules', async () => {
    const legacy = await compile('customDialog.module.scss');
    const mui = await compile('muiCustomDialog.module.scss');

    expect(mui['.customDialog']).toEqual(legacy['.customDialog']);
    expect(mui['.customDialogCloseButton']).toEqual(
      legacy['.customDialogCloseButton'],
    );
  });
});

describe('MuiDialog styles', () => {
  it('centers the icon badge with a selector that outranks Font Awesome', async () => {
    const legacy = await compile('dialog.module.scss');
    const mui = await compile('muiDialog.module.scss');
    const selector = '.dialog > .dialogIcon';

    expect(classCount(selector)).toBe(2);
    expect(mui[selector]).toEqual(legacy['.dialogIcon']);
    expect(mui[`${selector}::before`]).toEqual(legacy['.dialogIcon::before']);
  });

  it('scales the image down and keeps its proportions', async () => {
    const rules = await compile('muiDialog.module.scss');

    expect(rules['.dialogTextSection img']).toEqual({
      width: '16.25rem',
      'max-width': '100%',
      height: 'auto',
      'aspect-ratio': '260/138',
      'object-fit': 'contain',
    });
  });

  it('lets the panel shrink below its minimum width in a narrow viewport', async () => {
    const rules = await compile('muiDialog.module.scss');

    expect(rules['.dialog']).toMatchObject({
      'box-sizing': 'border-box',
      'min-width': 'min(39.375rem, 100%)',
      'max-width': 'min(50rem, 100%)',
    });
  });

  it('keeps every other legacy panel and section rule', async () => {
    const legacy = await compile('dialog.module.scss');
    const mui = await compile('muiDialog.module.scss');
    const legacyPanel = {...legacy['.dialog']};
    for (const prop of ['min-width', 'max-width']) {
      delete legacyPanel[prop];
    }
    const customDialog = (await compile('muiCustomDialog.module.scss'))[
      '.customDialog'
    ];

    expect({...mui['.dialog'], ...customDialog}).toMatchObject(legacyPanel);
    for (const selector of [
      '.dialog:has(.dialogIcon)',
      '.dialogTextSection',
      '.dialogTextSection h2,\n.dialogTextSection p',
      '.dialogTextSection > h2,\n.dialogTextSection .dialogContent',
      '.dialogActionsSection',
    ]) {
      expect(mui[selector]).toEqual(legacy[selector]);
    }
  });
});
