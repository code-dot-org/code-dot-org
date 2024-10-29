import React from 'react';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import musicI18n from '../locale';
import {
  ImageAttributionCopyright,
  ImageAttributionLicenseVersion,
} from '../player/MusicLibrary';

import moduleStyles from './ImageAttributions.module.scss';

interface ImageAttributionsProps {
  attributions: ImageAttributionCopyright[];
}

const creativeCommonsLicenseLinks: {
  [version in ImageAttributionLicenseVersion]?: {name: string; url: string};
} = {
  CC2: {
    name: 'CC BY 2.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.en',
  },
  CC3: {
    name: 'CC BY 3.0',
    url: 'https://creativecommons.org/licenses/by/3.0/deed.en',
  },
  CC4: {
    name: 'CC BY-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.en',
  },
};

// A small amount of attribution information that will be passed to the copyright
// dialog.
const ImageAttributions: React.FunctionComponent<ImageAttributionsProps> = ({
  attributions,
}) => {
  if (attributions.length === 0) {
    return null;
  }

  const getMarkdown = (attribution: ImageAttributionCopyright) => {
    if (creativeCommonsLicenseLinks[attribution.licenseVersion]) {
      return musicI18n.imageAttributionBodyCreativeCommons({
        artist: attribution.artist,
        srcUrl: attribution.src || pegasus('/music'),
        author: attribution.author,
        licenseName:
          creativeCommonsLicenseLinks[attribution.licenseVersion]?.name || '',
        licenseUrl:
          creativeCommonsLicenseLinks[attribution.licenseVersion]?.url || '',
      });
    } else if (attribution.licenseVersion === 'C') {
      return musicI18n.imageAttributionBodyCopyright({
        artist: attribution.artist,
        year: attribution.year || '',
        author: attribution.author,
      });
    }

    return '';
  };

  return (
    <div>
      <b>{musicI18n.imageAttributionHeading()}</b>
      {attributions.map((attribution, index) => (
        <div key={index}>
          <SafeMarkdown
            openExternalLinksInNewTab
            markdown={getMarkdown(attribution)}
            className={moduleStyles.markdown}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageAttributions;
