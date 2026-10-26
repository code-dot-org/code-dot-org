// A screen as the map editor reads and writes it: the map, with the game's
// values kept beside it (specs/SCREEN_MAP_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import {
  addScreenProperty,
  readScreenHeader,
  writeScreenName,
  writeScreenPropertyDefault,
  writeScreenRuleValue,
  writeScreenTheme,
} from '../screenProperties';
import {
  mapFileDocument,
  screenDocumentFor,
  screenFileDocument,
} from '../worldDocument';
import type {WorldRuleProperty} from '../worldProperties';

const SCREEN = JSON.stringify({
  type: 'map',
  name: 'Coins',
  properties: [{name: 'score', type: 'number', value: '3'}],
  events: [{name: 'quit'}],
  rules: [
    {setter: 'world_set_Gravity_StrengthProperty', type: 'number', value: '9'},
  ],
  backgroundColor: '#112233',
  theme: 'styles/dark',
  size: {width: 10, height: 8},
  actors: [{id: 'game', type: 'actors/viewport'}],
});

const STRENGTH: WorldRuleProperty = {
  setter: 'world_set_Gravity_StrengthProperty',
  name: 'strength',
  type: 'number',
  rule: 'Gravity',
  default: '5',
};

describe('the Main Screen document', () => {
  it('reads the map the screen is', () => {
    const doc = screenFileDocument.read(SCREEN);
    expect(doc.size).toEqual({width: 10, height: 8});
    expect(doc.actors.map(actor => actor.id)).toEqual(['game']);
    expect(doc.theme).toBe('styles/dark');
  });

  it("keeps the game's values through a map edit", () => {
    const doc = screenFileDocument.read(SCREEN);
    const written = JSON.parse(
      screenFileDocument.write(SCREEN, {...doc, actors: []}),
    ) as Record<string, unknown>;

    expect(written.actors).toEqual([]);
    expect(written.name).toBe('Coins');
    expect(written.properties).toEqual(JSON.parse(SCREEN).properties);
    expect(written.events).toEqual([{name: 'quit'}]);
    expect(written.rules).toEqual(JSON.parse(SCREEN).rules);
    expect(written.backgroundColor).toBe('#112233');
  });

  it('keeps its layout through a map edit, and drops one it cannot read', () => {
    // specs/DOCKING_PLAN.md: the first edit to a screen used to write it back
    // without its layout, undocking the Viewport.
    const docked = JSON.stringify({
      ...JSON.parse(SCREEN),
      layout: {dock: 'game'},
    });
    const doc = screenFileDocument.read(docked);
    expect(doc.layout).toEqual({dock: 'game'});
    const written = JSON.parse(
      screenFileDocument.write(docked, {...doc, actors: doc.actors}),
    );
    expect(written.layout).toEqual({dock: 'game'});

    expect(
      screenFileDocument.read(
        JSON.stringify({...JSON.parse(SCREEN), layout: {dock: 7}}),
      ).layout,
    ).toBeUndefined();
  });

  it('is the Main Screen alone; another screen is a map', () => {
    expect(screenDocumentFor('screens/main.screen')).toBe(screenFileDocument);
    const other = screenDocumentFor('screens/title.screen');
    expect(other.world).toBeUndefined();
    expect(other.write).toBe(mapFileDocument.write);
    expect(other.modulePath('screens/title.screen')).toBe('screens/title');
  });
});

describe('the Main Screen header', () => {
  it('reads its name, values, rule settings, color and theme', () => {
    const header = readScreenHeader(SCREEN, [STRENGTH])!;

    expect(header.name).toBe('Coins');
    expect(header.properties).toEqual([
      {name: 'score', type: 'number', value: '3'},
      {
        name: 'strength',
        type: 'number',
        value: '9',
        setter: STRENGTH.setter,
        rule: 'Gravity',
      },
    ]);
    expect(header.backgroundColor).toEqual({color: '#112233', inCode: false});
    expect(header.theme).toBe('styles/dark');
  });

  it('shows a rule its own default when the screen says nothing', () => {
    const header = readScreenHeader('{"type": "map"}', [STRENGTH])!;
    expect(header.name).toBe('Main');
    expect(header.properties[0].value).toBe('5');
  });

  it('writes one key and leaves the rest', () => {
    const renamed = JSON.parse(writeScreenName(SCREEN, 'Gems'));
    expect(renamed.name).toBe('Gems');
    expect(renamed.actors).toEqual(JSON.parse(SCREEN).actors);

    const scored = JSON.parse(writeScreenPropertyDefault(SCREEN, 'score', '7'));
    expect(scored.properties).toEqual([
      {name: 'score', type: 'number', value: '7'},
    ]);
    expect(writeScreenPropertyDefault(SCREEN, 'lives', '7')).toBe(SCREEN);

    expect(JSON.parse(writeScreenTheme(SCREEN, undefined)).theme).toBe(
      undefined,
    );
  });

  it("drops a rule setting set back to the rule's own default", () => {
    const back = JSON.parse(writeScreenRuleValue(SCREEN, STRENGTH, '5'));
    expect(back.rules).toBeUndefined();

    const set = JSON.parse(writeScreenRuleValue(SCREEN, STRENGTH, '12'));
    expect(set.rules).toEqual([
      {setter: STRENGTH.setter, type: 'number', value: '12'},
    ]);
    // Text that is no number is not written.
    expect(writeScreenRuleValue(SCREEN, STRENGTH, 'lots')).toBe(SCREEN);
  });

  it('adds a value once, starting at its kind of nothing', () => {
    const added = JSON.parse(addScreenProperty(SCREEN, ' lives ', 'number'));
    expect(added.properties).toEqual([
      {name: 'score', type: 'number', value: '3'},
      {name: 'lives', type: 'number', value: '0'},
    ]);
    expect(addScreenProperty(SCREEN, 'score', 'number')).toBe(SCREEN);
    expect(addScreenProperty(SCREEN, '  ', 'number')).toBe(SCREEN);
  });
});
