import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import color from '@cdo/apps/util/color';

const styles = {
  heading: {
    marginTop: 25
  },
  button: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 15
  },
  clear: {
    clear: 'both'
  },
  header: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20
  },
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.teal,
    minHeight: 72,
    backgroundColor: color.white,
    overflowWrap: 'break-word'
  },
  message: {
    marginTop: 0,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 14
  }
};

function TeacherInfoBanner({header, primaryButton, secondaryButton, children}) {
  return (
    <div style={styles.main}>
      <div style={styles.message}>
        <h2 style={styles.heading}>{header}</h2>
        {children}
        {!primaryButton['isHidden'] && (
          <Button
            __useDeprecatedTag
            onClick={primaryButton['onClick']}
            href={primaryButton['href']}
            style={styles.button}
            size="large"
            text={primaryButton['text']}
            disabled={primaryButton['disabled']}
          />
        )}
        {!secondaryButton['isHidden'] && (
          <Button
            __useDeprecatedTag
            onClick={secondaryButton['onClick']}
            href={secondaryButton['href']}
            style={styles.button}
            color={Button.ButtonColor.gray}
            size="large"
            text={secondaryButton['text']}
          />
        )}
      </div>
      <div style={styles.clear} />
    </div>
  );
}

const infoBannerButtonShape = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  href: PropTypes.string,
  disabled: PropTypes.bool,
  isHidden: PropTypes.bool
};

TeacherInfoBanner.propTypes = {
  header: PropTypes.string.isRequired,
  primaryButton: PropTypes.shape(infoBannerButtonShape),
  secondaryButton: PropTypes.shape(infoBannerButtonShape),
  children: PropTypes.node
};

export default TeacherInfoBanner;
