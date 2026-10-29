// Fetching a project's images, as apps' loadAnimationFromSource did for
// Sprite Lab 2: each image is held as an object URL in `dataURI`.
import {DashboardApiClient} from '@code-dot-org/core/api';

import {mediaUrl} from '../../assetPaths';
import type {RuntimeAnimationList, SerializedAnimationProps} from '../../types';

/**
 * Where an animation's image is read from, as the media API takes it: an
 * image with a `sourceUrl` is read from there, asking for the saved version
 * of one the project uploaded; any other is looked up by key in the
 * project's animations.
 */
export function animationImageUrl(
  key: string,
  props: Pick<SerializedAnimationProps, 'sourceUrl' | 'version'>,
  channelId: string | undefined,
): string {
  const {sourceUrl, version} = props;
  if (sourceUrl) {
    const uploaded = sourceUrl.includes(`v3/animations/${channelId}`);
    return uploaded && !sourceUrl.includes('?version')
      ? `${sourceUrl}?version=${version || 'latestVersion'}`
      : sourceUrl;
  }
  const path = encodeURIComponent(key).replace(/%2F/g, '/');
  return `/v3/animations/${channelId}/${path}.png?version=${version || ''}`;
}

/**
 * Where a page shows an animation's image from. An image with a `sourceUrl`
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
}

/**
 * A copy of `list` in which every image that loads has an object URL in
 * `dataURI`. Entries that already have one are kept as they are. Revoke the
 * URLs with `revokeAnimationSources` when the list is replaced.
 */
export async function loadAnimationSources(
  list: RuntimeAnimationList,
  {channelId, onError}: LoadSourcesOptions,
): Promise<RuntimeAnimationList> {
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  await Promise.all(
    list.orderedKeys.map(async key => {
      const props = list.propsByKey[key];
      propsByKey[key] = props;
      if (props.dataURI) {
        return;
      }
      const url = animationImageUrl(key, props, channelId);
      // A data URL is the image itself.
      if (url.startsWith('data:')) {
        propsByKey[key] = {...props, dataURI: url};
        return;
      }
      try {
        const blob = await DashboardApiClient.media.getImage({url});
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
