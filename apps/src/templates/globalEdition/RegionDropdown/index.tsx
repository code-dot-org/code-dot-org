import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Typography from '@code-dot-org/component-library/typography';
import React from 'react';

import moduleStyles from './regionDropdown.module.scss';

export interface Region {
  /** The name of the global region */
  name: string;
  /** The sorted name of the region */
  globalName: string;
  /** The flag image to use */
  flag: string;
  /** The region tag to switch to */
  region: string;
}

export interface RegionDropdownProps {
  options: Region[];
  initialRegion: string;
  url: string;
  csrfToken: string;
}

/**
 * This gives a dropdown to display the set of regions available to the site.
 */
const RegionDropdown: React.FunctionComponent<RegionDropdownProps> = ({
  options,
  initialRegion,
  url,
  csrfToken,
}) => {
  const selectedOption: Region | undefined = options.find(
    option => option.region === initialRegion
  );

  return (
    <div className={moduleStyles.container}>
      <FontAwesomeV6Icon iconName="globe" iconStyle="solid" />
      <CustomDropdown
        className={moduleStyles.regionDropdown}
        size="s"
        name="region-dropdown"
        prologue={
          selectedOption ? (
            <img
              alt=""
              src={`/shared/images/header/flags/${selectedOption.flag}`}
            />
          ) : (
            ''
          )
        }
        labelText={selectedOption?.name || 'Select region...'}
      >
        <ul>
          {options.map(option => (
            <li key={`region-${option.region}`}>
              <form action={url} method="post" acceptCharset="UTF-8">
                <input
                  type="hidden"
                  name="authenticity_token"
                  value={csrfToken}
                />
                <input type="hidden" name="ge_region" value={option.region} />
                <button type="submit">
                  <img
                    src={`/shared/images/header/flags/${option.flag}`}
                    alt=""
                  />
                  <Typography semanticTag="span" visualAppearance="body-four">
                    {option.name}
                  </Typography>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </CustomDropdown>
    </div>
  );
};

export default RegionDropdown;
