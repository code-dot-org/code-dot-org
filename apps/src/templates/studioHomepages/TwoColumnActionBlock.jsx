import PropTypes from 'prop-types';
import React from 'react';
import Button from '@cdo/apps/templates/Button';
import {
  Heading2,
  BodyOneText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import styles from './twoColumnActionBlock.module.scss';

export default function TwoColumnActionBlock({
  id,
  imageUrl,
  heading,
  subHeading,
  description,
  buttons,
  marginBottom = '64px',
}) {
  return (
    <div id={id} className={styles.container}>
      {heading && <Heading2>{heading}</Heading2>}
      <div
        className={styles.actionBlockWrapper}
        style={{marginBottom: marginBottom}}
      >
        <img src={imageUrl} alt="" className={styles.image} />
        <div className={styles.contentWrapper}>
          {subHeading && (
            <BodyOneText
              visualAppearance={'heading-sm'}
              className="two-column-action-block--sub-heading"
            >
              {subHeading}
            </BodyOneText>
          )}
          <BodyThreeText>{description}</BodyThreeText>
          <div className={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <span key={index}>
                <Button
                  __useDeprecatedTag
                  href={button.url}
                  color={
                    button.color || Button.ButtonColor.brandSecondaryDefault
                  }
                  text={button.text}
                  target={button.target}
                  id={button.id}
                  onClick={button.onClick}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

TwoColumnActionBlock.propTypes = {
  id: PropTypes.string,
  imageUrl: PropTypes.string.isRequired,
  heading: PropTypes.string,
  subHeading: PropTypes.string,
  description: PropTypes.string.isRequired,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      target: PropTypes.string,
      id: PropTypes.string,
      color: PropTypes.oneOf(Object.values(Button.ButtonColor)),
    })
  ),

  marginBottom: PropTypes.string,
};
