/* If a dashboard page knows that it's going to have a banner image as part of
 * the page header, then it should include this component at its top so that it
 * can put a text header and subheader over that banner image.
 */

import React from 'react';
import color from "../util/color";
import ProgressButton from './progress/ProgressButton';
import i18n from "@cdo/locale";

const styles = {
  bannerHeading: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    fontSize: 32,
    marginBottom: 10,
    lineHeight: '40px'
  },
  bannerSubHeading: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 16,
    lineHeight: '32px',
    marginBottom: 10
  },
  bannerDescription: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    fontSize: 16,
    width: '600px',
    marginBottom: 20,
  },
  spacer: {
    marginBottom: '50px'
  },
  bigSpacer: {
    marginBottom: '150px'
  }
};

const HeadingBanner = React.createClass({
  propTypes: {
    extended: React.PropTypes.bool,
    headingText: React.PropTypes.string,
    subHeadingText: React.PropTypes.string,
    description: React.PropTypes.string,
  },

  render() {
    const {extended, headingText, subHeadingText, description} = this.props;

    return (
      <div>
        {!extended && (
          <div style={styles.spacer}/>
        )}
        <div style={styles.bannerHeading}>
          {headingText || <span>&nbsp;</span>}
        </div>
        <div style={styles.bannerSubHeading}>
          {subHeadingText || <span>&nbsp;</span>}
        </div>
        {extended ? (
          <div>
            <div style={styles.bannerDescription}>
              {description}
            </div>
            <ProgressButton
              href= "/users/sign_up"
              color={ProgressButton.ButtonColor.gray}
              text={i18n.createAccount()}
              style={styles.button}
            />
            <div style={styles.spacer}/>
          </div>
        ):(
          <div style={styles.bigSpacer}/>
        )}
      </div>
    );
  }
});

export default HeadingBanner;
