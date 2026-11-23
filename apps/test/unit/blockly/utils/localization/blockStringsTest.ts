import {localizeBlockStrings} from '@cdo/apps/blockly/utils/localization/blockStrings';

const TRANSLATIONS: {[source: string]: string} = {
  'Hello %1!': '¡%1, hola!',
  'Score: ': 'Puntos: ',
  'Hi %1 and %2': '%2 y %1, hola',
};

jest.mock('@cdo/apps/localization', () => ({
  __esModule: true,
  default: {
    translate: (text: string) => TRANSLATIONS[text] ?? text,
  },
}));

function parse(xml: string): Document {
  return new DOMParser().parseFromString(xml, 'text/xml');
}

function say(inner: string): string {
  return (
    '<xml><block type="gamelab_spriteSay" id="say">' +
    `<value name="TEXT">${inner}</value>` +
    '</block></xml>'
  );
}

function varJoin(id: string, name: string, next: string): string {
  return (
    `<block type="gamelab_textVariableJoin" id="${id}">` +
    `<field name="VAR">${name}</field>` +
    `<value name="TEXT2">${next}</value></block>`
  );
}

function join(attrs: string, text: string, next: string): string {
  return (
    `<block type="gamelab_textJoin" ${attrs}>` +
    `<field name="TEXT1">${text}</field>` +
    `<value name="TEXT2">${next}</value></block>`
  );
}

function text(attrs: string, value: string): string {
  return `<block type="text" ${attrs}><field name="TEXT">${value}</field></block>`;
}

// Returns the chain under the say block as [type, text-or-var, id] triples.
function chainOf(xml: string): string[][] {
  const doc = parse(xml);
  const out: string[][] = [];
  let block: Element | null = doc.querySelector(
    'block[type="gamelab_spriteSay"] > value > block'
  );
  while (block) {
    const type = block.getAttribute('type') || '';
    const field = block.querySelector(':scope > field');
    out.push([type, field?.textContent || '', block.getAttribute('id') || '']);
    block = block.querySelector(':scope > value[name="TEXT2"] > block');
  }
  return out;
}

describe('localizeBlockStrings', () => {
  it('reorders a join chain to follow the translation', () => {
    const xml = say(
      join('id="j1"', 'Hello ', varJoin('v1', 'name', text('id="t1"', '!')))
    );
    expect(chainOf(localizeBlockStrings(xml))).toEqual([
      ['gamelab_textJoin', '¡', 'j1'],
      ['gamelab_textVariableJoin', 'name', 'v1'],
      ['text', ', hola!', 't1'],
    ]);
  });

  it('leaves a chain ending in a non-chain block untouched', () => {
    const xml = say(
      join(
        'id="j1"',
        'Score: ',
        '<block type="variables_get" id="g1"><field name="VAR">score</field></block>'
      )
    );
    const result = parse(localizeBlockStrings(xml));
    expect(result.querySelector('block[id="g1"]')).not.toBeNull();
    expect(
      result.querySelector('block[id="j1"] > field[name="TEXT1"]')?.textContent
    ).toBe('Score: ');
  });

  it('leaves a chain holding a shadow untouched', () => {
    const xml = say(
      join(
        'id="j1"',
        'Score: ',
        '<shadow type="text" id="s1"><field name="TEXT"></field></shadow>'
      )
    );
    const result = parse(localizeBlockStrings(xml));
    expect(result.querySelector('shadow[id="s1"]')).not.toBeNull();
    expect(
      result.querySelector('block[id="j1"] > field[name="TEXT1"]')?.textContent
    ).toBe('Score: ');
  });

  it('keeps lock attributes on rebuilt blocks', () => {
    const lock = 'deletable="false" movable="false" editable="false"';
    const xml = say(
      join(
        `id="j1" ${lock}`,
        'Hi ',
        varJoin(
          'v1',
          'a',
          join(
            `id="j2" ${lock}`,
            ' and ',
            varJoin('v2', 'b', text(`id="t1" ${lock}`, ''))
          )
        )
      )
    );
    const result = localizeBlockStrings(xml);
    expect(chainOf(result)).toEqual([
      ['gamelab_textJoin', '', 'j1'],
      ['gamelab_textVariableJoin', 'b', 'v2'],
      ['gamelab_textJoin', ' y ', 'j2'],
      ['gamelab_textVariableJoin', 'a', 'v1'],
      ['text', ', hola', 't1'],
    ]);
    const doc = parse(result);
    for (const block of Array.from(doc.querySelectorAll('block'))) {
      const type = block.getAttribute('type');
      if (type === 'gamelab_textJoin' || type === 'text') {
        expect(block.getAttribute('deletable')).toBe('false');
        expect(block.getAttribute('movable')).toBe('false');
        expect(block.getAttribute('editable')).toBe('false');
      }
    }
  });

  it('gives extra rebuilt joins the head lock flags but no id', () => {
    const lock = 'deletable="false"';
    const xml = say(
      join(
        `id="j1" ${lock}`,
        'Hi ',
        varJoin('v1', 'a', varJoin('v2', 'b', text('', '')))
      )
    );
    TRANSLATIONS['Hi %1%2'] = '%1 %2';
    const doc = parse(localizeBlockStrings(xml));
    const joins = Array.from(
      doc.querySelectorAll('block[type="gamelab_textJoin"]')
    );
    expect(joins.map(j => j.getAttribute('id'))).toEqual(['j1', null]);
    expect(joins.map(j => j.getAttribute('deletable'))).toEqual([
      'false',
      'false',
    ]);
  });
});
