import {
  BLOCK_TYPES,
  PROCEDURE_DEFINITION_TYPES,
  stringIsXml,
} from '@cdo/apps/blockly/constants';
import localization from '@cdo/apps/localization';
import {parseElement} from '@cdo/apps/xml';

import {convertXmlToJson} from '../serialization/xmlToJson';

/**
 * The procedure and behavior names a level's author wrote, whose caller
 * blocks (procedures_callnoreturn, gamelab_behavior_get) may display a
 * translation. It is built from the level's configuration, never from the
 * workspace, so a name the student created, even one reloaded from their
 * saved work, always renders as typed.
 */
let translatable = new Set<string>();

type RegistryListener = () => void;
const listeners = new Set<RegistryListener>();
let notifyQueued = false;

// One notification per microtask, however many changes precede it.
function notifySoon(): void {
  if (notifyQueued) {
    return;
  }
  notifyQueued = true;
  queueMicrotask(() => {
    notifyQueued = false;
    for (const listener of listeners) {
      listener();
    }
  });
}

export function onRegistryChange(listener: RegistryListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isTranslatable(name: string): boolean {
  return translatable.has(name);
}

const BEHAVIOR_PREFIX = '[behavior]';

/**
 * The name to display for a procedure or behavior: its translation when the
 * level authored it, otherwise the name as stored.
 */
export function translateProcedureName(
  name: string,
  isBehavior: boolean
): string {
  if (!name || !isTranslatable(name)) {
    return name;
  }
  if (!isBehavior) {
    return localization.translate(name, ['blockly-procedure-name']);
  }
  // A behavior may be worded differently from a procedure of the same
  // English name, so it gets its own translator entry. A translator who
  // dropped the prefix still returned the translation.
  const translated = localization.translate(`${BEHAVIOR_PREFIX} ${name}`, [
    'blockly-procedure-name',
    'blockly-behavior',
  ]);
  return translated.startsWith(BEHAVIOR_PREFIX)
    ? translated.slice(BEHAVIOR_PREFIX.length).trim()
    : translated;
}

const CALLER_TYPES: readonly string[] = [
  BLOCK_TYPES.procedureCall,
  BLOCK_TYPES.behaviorGet,
];

const FIELD_TAGS = ['field', 'title'];

type JsonObject = {[key: string]: unknown};

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function addName(names: Set<string>, name: unknown): void {
  if (typeof name === 'string' && name) {
    names.add(name);
  }
}

// Definitions in a serialized workspace. Their names live in the procedure
// models, and also in each definition block's NAME field.
function addStartBlockNames(names: Set<string>, source: string): void {
  const state = stringIsXml(source)
    ? convertXmlToJson(parseElement(source))
    : JSON.parse(source);
  if (!isObject(state)) {
    return;
  }
  if (Array.isArray(state.procedures)) {
    for (const procedure of state.procedures) {
      if (isObject(procedure)) {
        addName(names, procedure.name);
      }
    }
  }
  const blocks = isObject(state.blocks) ? state.blocks.blocks : undefined;
  if (Array.isArray(blocks)) {
    for (const block of blocks) {
      if (
        isObject(block) &&
        PROCEDURE_DEFINITION_TYPES.includes(block.type as string) &&
        isObject(block.fields)
      ) {
        addName(names, block.fields.NAME);
      }
    }
  }
}

function xmlField(block: Element, name: string): string | null {
  for (const child of Array.from(block.children)) {
    if (
      FIELD_TAGS.includes(child.tagName.toLowerCase()) &&
      child.getAttribute('name') === name
    ) {
      return child.textContent;
    }
  }
  return null;
}

// A toolbox block in XML, and any blocks nested inside it.
function addXmlBlockNames(names: Set<string>, root: Element): void {
  const blocks = [root, ...Array.from(root.querySelectorAll('block'))];
  for (const block of blocks) {
    const type = block.getAttribute('type') || '';
    if (type === BLOCK_TYPES.procedureCall) {
      const mutation = Array.from(block.children).find(
        child => child.tagName.toLowerCase() === 'mutation'
      );
      addName(names, mutation?.getAttribute('name'));
    } else if (type === BLOCK_TYPES.behaviorGet) {
      // Legacy levels stored the behavior name in a VAR field.
      addName(names, xmlField(block, 'NAME') ?? xmlField(block, 'VAR'));
    } else if (PROCEDURE_DEFINITION_TYPES.includes(type)) {
      addName(names, xmlField(block, 'NAME'));
    }
  }
}

// A toolbox block in JSON, and any blocks nested in its inputs or next.
function addJsonBlockNames(names: Set<string>, block: JsonObject): void {
  const type = block.type as string;
  const fields = isObject(block.fields) ? block.fields : {};
  const extraState = isObject(block.extraState) ? block.extraState : {};
  if (
    CALLER_TYPES.includes(type) ||
    PROCEDURE_DEFINITION_TYPES.includes(type)
  ) {
    addName(names, extraState.name);
    addName(names, fields.NAME);
  }
  const children: unknown[] = [];
  if (isObject(block.inputs)) {
    for (const input of Object.values(block.inputs)) {
      if (isObject(input)) {
        children.push(input.block, input.shadow);
      }
    }
  }
  if (isObject(block.next)) {
    children.push(block.next.block);
  }
  for (const child of children) {
    if (isObject(child)) {
      addJsonBlockNames(names, child);
    }
  }
}

// Every block in a toolbox, in every category, whether or not its flyout has
// ever been opened.
function addToolboxNames(names: Set<string>, item: unknown): void {
  if (Array.isArray(item)) {
    item.forEach(child => addToolboxNames(names, child));
    return;
  }
  if (!isObject(item)) {
    return;
  }
  if (Array.isArray(item.contents)) {
    addToolboxNames(names, item.contents);
  }
  const kind = typeof item.kind === 'string' ? item.kind.toLowerCase() : '';
  if (kind !== 'block') {
    return;
  }
  const blockxml = item.blockxml;
  if (typeof blockxml === 'string') {
    addXmlBlockNames(names, parseElement(`<xml>${blockxml}</xml>`));
  } else if (
    blockxml &&
    typeof (blockxml as Element).getAttribute === 'function'
  ) {
    addXmlBlockNames(names, blockxml as Element);
  } else {
    addJsonBlockNames(names, item);
  }
}

export type CurriculumSources = {
  /** The level's start blocks, XML or JSON, with shared functions appended. */
  startBlocks?: string;
  /** The parsed toolbox definition (a workspace's options.languageTree). */
  toolbox?: unknown;
};

/**
 * Replaces the registry with the names a level's start blocks and toolbox
 * define or call. Call once per level, before its blocks render. A source
 * that cannot be read contributes nothing; the level's own load reports it.
 */
export function setCurriculumProcedureNames({
  startBlocks,
  toolbox,
}: CurriculumSources): void {
  const names = new Set<string>();
  if (startBlocks) {
    try {
      addStartBlockNames(names, startBlocks);
    } catch (e) {
      console.warn('Could not read procedure names from start blocks', e);
    }
  }
  try {
    addToolboxNames(names, toolbox);
  } catch (e) {
    console.warn('Could not read procedure names from the toolbox', e);
  }

  const changed =
    names.size !== translatable.size ||
    Array.from(names).some(name => !translatable.has(name));
  translatable = names;
  if (changed) {
    notifySoon();
  }
}
