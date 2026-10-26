// The Main Screen's name and game-wide values, read from and written to its
// data (specs/SCREEN_MAP_PLAN.md, step 4).
//
// The same header the world's inspector shows (`worldProperties`), from a
// document that holds as keys what a world held as rows: no workspace walk,
// only the five keys `blockly/screenData` describes. Each write changes one
// key and leaves the rest of the file as it was.

import {
  DEFAULT_SCREEN_NAME,
  literalBlock,
  type ScreenData,
  type ScreenProperty,
  type ScreenRuleSetting,
} from '../blockly/screenData';

import type {
  WorldHeader,
  WorldProperty,
  WorldRuleProperty,
} from './worldProperties';

type Document = ScreenData & Record<string, unknown>;

const parse = (contents: string): Document | undefined => {
  try {
    const parsed = JSON.parse(contents) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Document)
      : undefined;
  } catch {
    return undefined;
  }
};

const list = <T>(held: unknown): T[] =>
  Array.isArray(held) ? (held.filter(Boolean) as T[]) : [];

/** The screen's name and values, or nothing for a file that will not parse. */
export function readScreenHeader(
  contents: string,
  ruleProperties: readonly WorldRuleProperty[] = [],
): WorldHeader | undefined {
  const data = parse(contents);
  if (!data) {
    return undefined;
  }
  const settings = list<ScreenRuleSetting>(data.rules);
  const properties: WorldProperty[] = [
    ...list<ScreenProperty>(data.properties).map(property => ({
      name: property.name,
      type: property.type || 'number',
      value: String(property.value ?? ''),
    })),
    // Each rule's, showing what the screen says or, saying nothing, the
    // rule's own — as a world's inspector shows them.
    ...ruleProperties.map(property => ({
      name: property.name,
      type: property.type,
      value:
        settings.find(setting => setting.setter === property.setter)?.value ??
        property.default,
      setter: property.setter,
      rule: property.rule,
    })),
  ];
  return {
    name: data.name || DEFAULT_SCREEN_NAME,
    properties,
    backgroundColor: {color: data.backgroundColor || undefined, inCode: false},
    theme: data.theme || undefined,
  };
}

/** Parse, change, and write back — or the contents as they were on a miss. */
function rewrite(
  contents: string,
  change: (data: Document) => boolean,
): string {
  const data = parse(contents);
  if (!data || !change(data)) {
    return contents;
  }
  return JSON.stringify(data, null, 2);
}

export const writeScreenName = (contents: string, name: string): string =>
  rewrite(contents, data => {
    data.name = name;
    return true;
  });

export const writeScreenTheme = (
  contents: string,
  theme: string | undefined,
): string =>
  rewrite(contents, data => {
    if (theme) {
      data.theme = theme;
    } else {
      delete data.theme;
    }
    return true;
  });

export const writeScreenBackgroundColor = (
  contents: string,
  color: string,
): string =>
  rewrite(contents, data => {
    data.backgroundColor = color;
    return true;
  });

/**
 * One game-wide value's starting value, or the file as it was when the
 * screen declares no value of that name.
 */
export const writeScreenPropertyDefault = (
  contents: string,
  property: string,
  value: string,
): string =>
  rewrite(contents, data => {
    const found = list<ScreenProperty>(data.properties).find(
      each => each.name === property,
    );
    if (!found) {
      return false;
    }
    found.value = value;
    return true;
  });

/**
 * A rule's setting. A value equal to the rule's own default takes the
 * setting away, so the screen says only what differs from the rules it
 * holds, as a world's rows did; text that is no literal of the type is not
 * written.
 */
export const writeScreenRuleValue = (
  contents: string,
  property: WorldRuleProperty,
  value: string,
): string => {
  if (!literalBlock(property.type, value)) {
    return contents;
  }
  return rewrite(contents, data => {
    const kept = list<ScreenRuleSetting>(data.rules).filter(
      setting => setting.setter !== property.setter,
    );
    const rules =
      value === property.default
        ? kept
        : [...kept, {setter: property.setter, type: property.type, value}];
    if (rules.length) {
      data.rules = rules;
    } else {
      delete data.rules;
    }
    return true;
  });
};

/** The value a new game-wide value of each type starts at. */
const STARTING: Record<string, string> = {
  number: '0',
  string: '',
  boolean: 'false',
};

/**
 * A new game-wide value, or the file as it was when the name is empty or
 * one of that name is already declared: two would be one name with two
 * slots, and the first would win (`ownProperties`).
 */
export const addScreenProperty = (
  contents: string,
  name: string,
  type: string,
): string => {
  const trimmed = name.trim();
  return rewrite(contents, data => {
    const held = list<ScreenProperty>(data.properties);
    if (!trimmed || held.some(each => each.name === trimmed)) {
      return false;
    }
    data.properties = [
      ...held,
      {name: trimmed, type, value: STARTING[type] ?? ''},
    ];
    return true;
  });
};
