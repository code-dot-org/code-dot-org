import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import color from "../util/color";
import GridContainer from './studioHomepages/GridContainer';
import Button from '@cdo/apps/templates/Button';

const styles = {
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
    imageUrl: PropTypes.string.isRequired,
    heading: PropTypes.string.isRequired,
    subHeading: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    buttons: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })),
    responsiveSize: PropTypes.string,
    isRtl: PropTypes.bool.isRequired
  };

  render() {
    const { imageUrl, heading, subHeading, description, buttons, responsiveSize, isRtl } = this.props;

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
          responsiveSize={responsiveSize}
        >
          {!responsiveSize ||responsiveSize ==='lg' && (
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

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(TwoColumnActionBlock);
