import previewMetadata from '@cdo/static/dance/preview-metadata.json';

import {SongMetadata} from './types';

// Common utils shared between legacy and Lab2 Dance

function computeCharactersReferenced(studentCode: string): string[] {
  // Process studentCode to determine which characters are referenced and create
  // charactersReferencedSet with the results:
  const charactersReferencedSet = new Set<string>();
  const charactersRegExp = new RegExp(
    /^.*make(Anonymous|New)DanceSprite(?:Group)?\([^"]*"([^"]*)[^\r\n]*/,
    'gm'
  );
  let match;
  while ((match = charactersRegExp.exec(studentCode))) {
    const characterName = match[2];
    charactersReferencedSet.add(characterName);
  }

  // Special parsing for the JSON parameter to ai().
  const aiCharactersRegExp = new RegExp(/ai\(([^\)]*)/, 'gm');
  while ((match = aiCharactersRegExp.exec(studentCode))) {
    if (match[1] === 'undefined') {
      continue;
    }
    try {
      const params = JSON.parse(match[1]);
      if (params.dancers && params.dancers.type) {
        const characterName = params.dancers.type.toUpperCase();
        charactersReferencedSet.add(characterName);
      }
    } catch (e) {
      console.log('Invalid JSON for ai() block.');
    }
  }

  return Array.from(charactersReferencedSet);
}

// Generate the validation callback from stringified validation code.
// TODO: We're allowing the return type to be a generic 'Function' since the Dance Party
// repo currently doesn't export types. If/when types are available, we can narrow the
// return type.
// eslint-disable-next-line @typescript-eslint/ban-types
function getValidationCallback(validationCode: string): Function {
  return new Function(
    'World',
    'nativeAPI',
    'sprites',
    'events',
    validationCode
  );
}

/**
 * Returns fixed song metadata for the Dance Party live preview,
 * updated with the current song's artist and title.
 */
function getSongMetadataForPreview(songMetadata: SongMetadata): SongMetadata {
  return {
    ...previewMetadata,
    title: songMetadata.title,
    artist: songMetadata.artist,
  };
}

// Need to use default exports for stubbing these functions in tests
export default {
  computeCharactersReferenced,
  getValidationCallback,
  getSongMetadataForPreview,
};
