import React, {Component, PropTypes} from 'react';
import color from "../util/color";
import GridContainer from './studioHomepages/GridContainer';
import Button from '@cdo/apps/templates/Button';
import Responsive from '../responsive';
import styleConstants from '../styleConstants';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const contentWidth = styleConstants['content-width'];

const styles = {
  fullWidthNonResponsive: {
    width: contentWidth
  },
  heading: {
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    lineHeight: '26px',
    fontFamily: 'Gotham 3r',
    color: color.charcoal
  },
  textItem: {
    backgroundColor: color.teal,
    padding: 30,
    height: 260,
    boxSizing: 'border-box'
  },
  subheading: {
    paddingRight: 10,
    paddingBottom: 20,
    fontSize: 27,
    lineHeight: 1.2,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white
  },
  description: {
    paddingRight: 10,
    paddingBottom: 20,
    fontSize: 14,
    fontFamily: 'Gotham 4r',
    lineHeight: '22px',
    color: color.white
  },
  clear: {
    clear: 'both',
    marginBottom: 60
  }
};

class TwoColumnActionBlock extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive),
    imageUrl: PropTypes.string.isRequired,
    heading: PropTypes.string,
    subHeading: PropTypes.string,
    description: PropTypes.string.isRequired,
    buttons: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })),
  };

  render() {
    const { isRtl, responsive, imageUrl, heading, subHeading, description, buttons } = this.props;

    return (
      <div>
        {heading && (
          <div style={styles.heading}>
            {heading}
          </div>
        )}
        <GridContainer
          numColumns={2}
          isRtl={isRtl}
          responsive={responsive}
        >
          {(!responsive || responsive.isResponsiveCategoryActive('lg')) && (
            <img src={imageUrl}/>
          )}
          <div style={styles.textItem}>
            {subHeading && (
              <div style={styles.subheading}>
                {subHeading}
              </div>
            )}
            <div style={styles.description}>
              {description}
            </div>
            {buttons.map((button, index) =>
              <span key={index}>
                <Button
                  href={button.url}
                  color={Button.ButtonColor.gray}
                  text={button.text}
                />
                &nbsp;
                &nbsp;
                &nbsp;
              </span>
            )}
          </div>
        </GridContainer>
        <div style={styles.clear}/>
      </div>
    );
  }
}
