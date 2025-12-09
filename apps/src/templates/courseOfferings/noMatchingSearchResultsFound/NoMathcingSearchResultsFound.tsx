import Button from '@code-dot-org/component-library/button';
import Image, {ImageProps} from '@code-dot-org/component-library/image';
import {
  Heading2,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
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
      <Heading2 noMargin>{noResultsHeadingText}</Heading2>
      {noResultsSubHeadingText && (
        <BodyTwoText noMargin>{noResultsSubHeadingText}</BodyTwoText>
      )}
      {onClearAllFilters && (
        <Button
          onClick={onClearAllFilters}
          text={i18n.clearFilters()}
          color="purple"
          type="primary"
        />
      )}
    </div>
  );
};

export default NoMatchingSearchResultsFound;
