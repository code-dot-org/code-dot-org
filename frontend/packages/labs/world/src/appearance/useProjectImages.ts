// The project's images, decoded, for anything that draws one.
//
// A picker shows pictures, and a picture on a canvas needs an `HTMLImageElement`
// — the project holds bytes on a `url`. Decoding is asynchronous, so the map
// fills in as they arrive and the caller re-renders; a picker opened before one
// has decoded simply shows nothing for it, and then shows it.

import {useEffect, useRef, useState} from 'react';

import type {MultiFileSource} from '@code-dot-org/core/api';

/** Decoded images by file name (`player.png`). */
export function useProjectImages(
  source: MultiFileSource | undefined,
): Record<string, HTMLImageElement> {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  // What has been asked for, by file name. Not `image.src`: assigning a
  // relative URL (`/v3/assets/…`, which is what an upload stores) reads back as
  // the absolute one, so comparing against it never matches — and a decode that
  // always looks undone is a decode that never stops, re-rendering everything
  // under this hook forever.
  const requested = useRef<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    for (const file of Object.values(source?.files ?? {})) {
      if (!file.url) {
        continue;
      }
      const {name, url} = file;
      if (requested.current[name] === url) {
        continue;
      }
      requested.current[name] = url;
      const image = new Image();
      image.onload = () => {
        if (!cancelled) {
          setImages(previous => ({...previous, [name]: image}));
        }
      };
      image.src = url;
    }
    return () => {
      cancelled = true;
    };
  }, [source]);

  return images;
}

/**
 * The sizes of decoded images, by file name.
 *
 * The other half of {@link projectImageSizes}, which reads a PNG's header and
 * so only knows the images the project carries as bytes. An UPLOADED image is a
 * URL — its size is not knowable without loading it, and by the time it is
 * decoded here, it is.
 */
export function sizesOfImages(
  images: Record<string, HTMLImageElement>,
): Record<string, {width: number; height: number}> {
  const sizes: Record<string, {width: number; height: number}> = {};
  for (const [name, image] of Object.entries(images)) {
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      sizes[name] = {width: image.naturalWidth, height: image.naturalHeight};
    }
  }
  return sizes;
}
