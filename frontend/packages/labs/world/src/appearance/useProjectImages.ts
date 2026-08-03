// The project's images, decoded, for anything that draws one.
//
// A picker shows pictures, and a picture on a canvas needs an `HTMLImageElement`
// — the project holds bytes on a `url`. Decoding is asynchronous, so the map
// fills in as they arrive and the caller re-renders; a picker opened before one
// has decoded simply shows nothing for it, and then shows it.

import {useEffect, useState} from 'react';

import type {MultiFileSource} from '@code-dot-org/core/api';

/** Decoded images by file name (`player.png`). */
export function useProjectImages(
  source: MultiFileSource | undefined,
): Record<string, HTMLImageElement> {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    let cancelled = false;
    for (const file of Object.values(source?.files ?? {})) {
      if (!file.url) {
        continue;
      }
      const {name, url} = file;
      // Already decoded from the same bytes: nothing to do.
      if (images[name]?.src === url) {
        continue;
      }
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
  }, [source, images]);

  return images;
}
