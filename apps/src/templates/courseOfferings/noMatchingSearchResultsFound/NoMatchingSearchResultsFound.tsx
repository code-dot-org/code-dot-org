import Image, {ImageProps} from '@code-dot-org/component-library/image';
import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import moduleStyles from './noMatchingSearchResultsFound.module.scss';

type NoMatchingSearchResultsFoundProps = {
  onClearAllFilters?: () => void;
  illustrationImageProps?: ImageProps;
  noResultsHeadingText: string;
  noResultsSubHeadingText?: string;
};

const NoMatchingSearchResultsFound: React.FunctionComponent<
  NoMatchingSearchResultsFoundProps
> = ({
  onClearAllFilters,
  illustrationImageProps,
  noResultsHeadingText,
  noResultsSubHeadingText,
}) => {
  return (
    <div className={moduleStyles.noResultsFoundContainer}>
      {illustrationImageProps && <Image {...illustrationImageProps} />}
      <Typography variant="h2">{noResultsHeadingText}</Typography>
      {noResultsSubHeadingText && (
        <Typography variant="body2">{noResultsSubHeadingText}</Typography>
      )}
      {onClearAllFilters && (
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          onClick={onClearAllFilters}
          type="button"
        >
          {i18n.clearFilters()}
        </MuiButton>
      )}
    </div>
  );
};

export default NoMatchingSearchResultsFound;
