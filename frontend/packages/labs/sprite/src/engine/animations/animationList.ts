// A project's saved animation list made ready to load, as apps'
// setInitialAnimationList did before fetching.
import type {RuntimeAnimationList, RuntimeAnimationProps} from '../../types';

const REQUIRED_PROPS = [
  'name',
  'frameSize',
  'frameCount',
  'looping',
  'frameDelay',
] as const;

type SavedProps = Partial<RuntimeAnimationProps> & {
  key?: string;
  frameRate?: unknown;
};

/**
 * A copy of `saved` with ANI-39's defaults filled in, duplicate names
 * renamed, and duplicate keys dropped. Throws when the list is malformed.
 * A missing list is empty, and the 2015 array form is converted.
 */
export function normalizeAnimationList(saved: unknown): RuntimeAnimationList {
  if (saved === undefined || saved === null) {
    return {orderedKeys: [], propsByKey: {}};
  }
  const list = Array.isArray(saved)
    ? {
        orderedKeys: (saved as SavedProps[]).map(a => a.key as string),
        propsByKey: Object.fromEntries(
          (saved as SavedProps[]).map(a => [a.key as string, {...a}]),
        ),
      }
    : structuredClone(saved as {orderedKeys: unknown; propsByKey: unknown});

  const propsByKey = list.propsByKey as Record<string, SavedProps>;
  for (const props of Object.values(propsByKey ?? {})) {
    if (!props.frameDelay) {
      const rate = props.frameRate;
      props.frameDelay =
        typeof rate === 'number' && !isNaN(rate) && rate !== 0
          ? Math.round(30 / rate)
          : 2;
    }
    if (props.looping === undefined) {
      props.looping = true;
    }
  }

  const valid = validated(list);
  renameDuplicates(valid);
  return valid;
}

function validated(list: {
  orderedKeys: unknown;
  propsByKey: unknown;
}): RuntimeAnimationList {
  if (!Array.isArray(list.orderedKeys)) {
    throw new Error('orderedKeys is not an array');
  }
  const orderedKeys = [...new Set(list.orderedKeys as string[])];
  const propsByKey = list.propsByKey;
  if (typeof propsByKey !== 'object' || propsByKey === null) {
    throw new Error('propsByKey is not an object');
  }
  for (const [key, props] of Object.entries(propsByKey)) {
    for (const name of REQUIRED_PROPS) {
      if (!Object.prototype.hasOwnProperty.call(props, name)) {
        throw new Error(
          `Required prop '${name}' is missing from animation with key '${key}'.`,
        );
      }
    }
  }
  const propKeys = new Set(Object.keys(propsByKey));
  const unmatchedKeys = orderedKeys.filter(key => !propKeys.has(key));
  if (unmatchedKeys.length > 0) {
    throw new Error(
      `Animation List has keys without props: ${unmatchedKeys.join(', ')}`,
    );
  }
  const keySet = new Set(orderedKeys);
  const unmatchedProps = [...propKeys].filter(key => !keySet.has(key));
  if (unmatchedProps.length > 0) {
    throw new Error(
      `Animation List has props not in orderedKeys: ${unmatchedProps.join(', ')}`,
    );
  }
  return {
    orderedKeys,
    propsByKey: propsByKey as RuntimeAnimationList['propsByKey'],
  };
}

/** Each later animation that repeats a name gets `name_n`, n the lowest free. */
function renameDuplicates(list: RuntimeAnimationList): void {
  const {orderedKeys, propsByKey} = list;
  for (let i = 0; i < orderedKeys.length; i++) {
    const name = propsByKey[orderedKeys[i]].name;
    for (let j = i + 1; j < orderedKeys.length; j++) {
      const other = propsByKey[orderedKeys[j]];
      if (other.name === name) {
        other.name = uniqueName(name, list);
      }
    }
  }
}

/** `baseName_n` with n the lowest number no image in `list` uses. */
export function uniqueName(
  baseName: string,
  list: RuntimeAnimationList,
): string {
  const taken: number[] = [];
  for (const {name} of Object.values(list.propsByKey)) {
    if (name?.startsWith(baseName)) {
      const rest = name.replace(baseName, '');
      if (rest[0] === '_') {
        taken.push(parseInt(rest.split('_').pop() as string));
      }
    }
  }
  taken.sort((a, b) => a - b);
  let n = 1;
  for (const number of taken) {
    if (number !== n) {
      break;
    }
    n++;
  }
  return `${baseName}_${n}`;
}
