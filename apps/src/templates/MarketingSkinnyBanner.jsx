import React from 'react';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import DCDO from '@cdo/apps/dcdo';

// Not using inline styles to keep regular and responsive styles together.
//   Copied styles from 'shared/css/csa_skinny_banner.scss' that's used
//   in the Pegasus version of this banner:
//  'pegasus/sites.v3/code.org/views/csa_skinny_banner.haml'.
import './marketingSkinnyBanner.scss';

const IMAGE_BASE_URL = '/blockly/media/';

// Skinny banner component
// Current: CSA Launch May 2022
export default function MarketingSkinnyBanner() {
  const header_text = 'A new approach to AP® CSA!';
  const text =
    'Creative projects and real world connections in our equity-driven curriculum';

  // Only show if DCDO flag is set to true,
  //   otherwise return null.
  if (!!DCDO.get('csa-skinny-banner', false)) {
    return (
      <a
        href={pegasus('/educate/csa')}
        title="Learn more about Code.org's AP® CSA curriculum"
      >
        <aside>
          <div className="text-wrapper">
            <h1>{header_text}</h1>
            <p>{text}</p>
          </div>
          <img
            src={IMAGE_BASE_URL + 'csa-skinny-banner-image.png'}
            alt="Two screenshots of the CSA curriculum w/ the College Board AP® CSA Endorsed badge"
          />
          <span>Learn more</span>
        </aside>
      </a>
    );
  }

  return null;
}
