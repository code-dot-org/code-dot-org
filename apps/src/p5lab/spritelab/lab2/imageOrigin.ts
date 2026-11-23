import {RuntimeAnimationList, SerializedAnimationProps} from './types';

/**
 * How an image came to look the way it does: straight from AI, from AI and
 * then edited by hand, drawn or edited by hand with no AI, or none of these
 * (an upload, or a picture the level supplied).
 */
export type ImageOrigin =
  | 'generated'
  | 'generatedThenEdited'
  | 'drawn'
  | 'other';

export function imageOrigin(
  props: Pick<
    SerializedAnimationProps,
    'generation' | 'edited' | 'fromGeneration'
  >
): ImageOrigin {
  if (props.generation) {
    return 'generated';
  }
  if (props.edited) {
    return props.fromGeneration ? 'generatedThenEdited' : 'drawn';
  }
  return 'other';
}

export function countImageOrigins(
  list: RuntimeAnimationList
): Record<ImageOrigin, number> {
  const counts = {generated: 0, generatedThenEdited: 0, drawn: 0, other: 0};
  (list.orderedKeys || []).forEach(key => {
    const props = list.propsByKey[key];
    if (props) {
      counts[imageOrigin(props)]++;
    }
  });
  return counts;
}

/** The origin of the newest image carrying the role, if there is one. */
export function originOfImageInRole(
  list: RuntimeAnimationList,
  role: string | undefined
): ImageOrigin | undefined {
  // The list is kept newest first.
  const key =
    role &&
    (list.orderedKeys || []).find(k => list.propsByKey[k]?.role === role);
  return key ? imageOrigin(list.propsByKey[key]) : undefined;
}
