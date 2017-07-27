import React from 'react';
import color from "../../util/color";
import GridContainer from './GridContainer';
import Button from '@cdo/apps/templates/Button';
import i18n from "@cdo/locale";

const styles = {
  heading: {
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    fontFamily: 'Gotham 5r',
    color: color.charcoal
  },
  imageItem: {
    height: 260
  },
  textItem: {
    backgroundColor: color.teal,
    padding: 40,
    height: 260,
    boxSizing: 'border-box'
  },
  subheading: {
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    fontFamily: 'Gotham 5r',
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
    height: 30
  }
};

const FindLocalClassBanner = React.createClass({
  propTypes: {
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { codeOrgUrlPrefix, isRtl } = this.props;

    return (
      <div>
        <div style={styles.clear}/>
        <div style={styles.heading}>
          {i18n.findLocalClassHeading()}
        </div>
        <GridContainer
          numColumns={2}
          isRtl={isRtl}
        >
          <div style={styles.imageItem}>
            <img src={`${codeOrgUrlPrefix}/shared/images/fill-540x289/misc/beyond-local-map.png`}/>
          </div>
          <div style={styles.textItem}>
            <div style={styles.subheading}>
              {i18n.findLocalClassSubheading()}
            </div>
            <div style={styles.description}>
              {i18n.findLocalClassDescription()}
            </div>
            <Button
              href={`${codeOrgUrlPrefix}/learn/local`}
              color={Button.ButtonColor.gray}
              text={i18n.findLocalClassButton()}
            />
          </div>
        </GridContainer>
        <div style={styles.clear}/>
      </div>
    );
  }
});

export default FindLocalClassBanner;
