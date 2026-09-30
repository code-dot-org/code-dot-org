// Fetching a project's images, as apps' loadAnimationFromSource did for
// Sprite Lab 2: each image is held as an object URL in `dataURI`.
import {mediaUrl} from '../../assetPaths';
import type {RuntimeAnimationList, SerializedAnimationProps} from '../../types';

/**
 * Where an animation's image is fetched from. An image with a `sourceUrl`
 * outside the project's own animations (library, levelbuilder) is fetched
 * from there; one the project uploaded asks for its saved version; any other
 * is looked up by key in the project's animations.
 */
export function animationSourceUrl(
  key: string,
  props: Pick<SerializedAnimationProps, 'sourceUrl' | 'version'>,
  channelId: string | undefined,
): string {
  const {sourceUrl, version} = props;
  if (sourceUrl) {
    const uploaded = sourceUrl.includes(`v3/animations/${channelId}`);
    if (!uploaded || sourceUrl.includes('?version')) {
      return mediaUrl(sourceUrl);
    }
    return `${mediaUrl(sourceUrl)}?version=${version || 'latestVersion'}`;
  }
  const path = encodeURIComponent(key).replace(/%2F/g, '/');
  return `/v3/animations/${channelId}/${path}.png?version=${version || ''}`;
}

export interface LoadSourcesOptions {
  channelId: string | undefined;
  /** Called for each image that fails to load; the image stays unloaded. */
  onError?: (key: string, name: string, error: unknown) => void;
  fetch?: typeof fetch;
}

/**
 * A copy of `list` in which every image that loads has an object URL in
 * `dataURI`. Entries that already have one are kept as they are. Revoke the
 * URLs with `revokeAnimationSources` when the list is replaced.
 */
export async function loadAnimationSources(
  list: RuntimeAnimationList,
  {channelId, onError, fetch: fetchImpl = fetch}: LoadSourcesOptions,
): Promise<RuntimeAnimationList> {
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  await Promise.all(
    list.orderedKeys.map(async key => {
      const props = list.propsByKey[key];
      propsByKey[key] = props;
      if (props.dataURI) {
        return;
      }
      try {
        const response = await fetchImpl(
          animationSourceUrl(key, props, channelId),
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const blob = await response.blob();
        propsByKey[key] = {...props, dataURI: URL.createObjectURL(blob)};
      } catch (error) {
        onError?.(key, props.name, error);
      }
    }),
  );
  return {orderedKeys: [...list.orderedKeys], propsByKey};
}

/** Frees the object URLs `loadAnimationSources` made for `list`. */
export function revokeAnimationSources(
  list: RuntimeAnimationList | undefined,
): void {
  for (const props of Object.values(list?.propsByKey ?? {})) {
    if (props.dataURI?.startsWith('blob:')) {
      URL.revokeObjectURL(props.dataURI);
    }
  }
}
