import PropTypes from 'prop-types';
import React from 'react';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {
  Heading2,
  OverlineTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';

import styles from './actionBlocksWrapper.module.scss';

const OneColumnActionBlock = ({
  overline,
  imageUrl,
  heading,
  description,
  buttons,
}) => {
  return (
    <div className={styles.oneColumnActionBlock}>
      <div className={styles.contentWrapper}>
        {overline && (
          <OverlineTwoText className={styles.overline}>
            {overline}
          </OverlineTwoText>
        )}
        {heading && (
          <Heading2 visualAppearance="heading-md">{heading}</Heading2>
        )}
        {imageUrl && <img src={imageUrl} alt="" />}
        {description && <BodyThreeText>{description}</BodyThreeText>}
      </div>
      <div className={styles.buttonWrapper}>
        {buttons &&
          buttons.map((button, index) => (
            <LinkButton
              key={index}
              color={button.color}
              href={button.url}
              size="m"
              text={button.text}
              type={button.type}
              ariaLabel={button.ariaLabel}
            />
          ))}
      </div>
    </div>
  );
};

OneColumnActionBlock.propTypes = {
  overline: PropTypes.string,
  imageUrl: PropTypes.string,
  heading: PropTypes.string,
  description: PropTypes.string,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      url: PropTypes.string,
      size: PropTypes.string,
      text: PropTypes.string,
      target: PropTypes.string,
      type: PropTypes.string,
      ariaLabel: PropTypes.string,
    })
  ),
};

export default function ActionBlocksWrapper({actionBlocks}) {
  return (
    <div
      className={
        // This automatically adjusts the column count CSS
        // based on the number of blocks in an array.
        // If there are 3 or more, it'll use a 3-column layout.
        // For example: 6 blocks would result in a 3x2 grid.
        actionBlocks?.length >= 3
          ? styles.wrapperThreeCol
          : styles.wrapperTwoCol
      }
    >
      {actionBlocks.map((actionBlock, index) => (
        <OneColumnActionBlock
          key={index}
          overline={actionBlock.overline}
          heading={actionBlock.heading}
          imageUrl={actionBlock.imageUrl}
          description={actionBlock.description}
          buttons={actionBlock.buttons}
        />
      ))}
    </div>
  );
}

ActionBlocksWrapper.propTypes = {
  actionBlocks: PropTypes.arrayOf(PropTypes.object),
};
