import PropTypes from 'prop-types';
import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {Heading3, BodyThreeText} from '@cdo/apps/componentLibrary/typography';

import styles from './borderedCallToAction.module.scss';

const BorderedCallToAction = ({
  headingText,
  descriptionText,
  className,
  buttonType,
  buttonText,
  buttonUrl,
  buttonClass,
  buttonColor,
  buttonDisabled = false,
  onClick,
  solidBorder,
}) => {
  if (!buttonUrl && !onClick) {
    throw new Error('Expect at least one of buttonUrl / onClick');
  }

  const borderStyle = solidBorder ? styles.solidBorder : styles.dashedBorder;

  return (
    <div className={`${styles.outerBox} ${borderStyle} ${className}`}>
      <div className={styles.textWrapper}>
        <Heading3 visualAppearance="heading-sm">{headingText}</Heading3>
        <BodyThreeText>{descriptionText}</BodyThreeText>
      </div>
      <Button
        onClick={onClick}
        className={buttonClass}
        color={buttonColor}
        size={'s'}
        type={buttonType}
        text={buttonText}
        href={buttonUrl}
        useAsLink={!!buttonUrl}
        disabled={buttonDisabled}
      />
    </div>
  );
};

BorderedCallToAction.propTypes = {
  headingText: PropTypes.string.isRequired,
  descriptionText: PropTypes.string.isRequired,
  className: PropTypes.string,
  buttonType: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  buttonUrl: PropTypes.string,
  buttonClass: PropTypes.string,
  buttonColor: PropTypes.string,
  onClick: PropTypes.func,
  solidBorder: PropTypes.bool,
  buttonDisabled: PropTypes.bool,
};

export default BorderedCallToAction;
