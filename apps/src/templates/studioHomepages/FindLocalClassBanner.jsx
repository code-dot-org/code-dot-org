import React, {Component, PropTypes} from 'react';
import color from "../../util/color";
import GridContainer from './GridContainer';
import Button from '@cdo/apps/templates/Button';
import Responsive from '../../responsive';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  heading: {
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    fontFamily: 'Gotham 5r',
    color: color.charcoal
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
    marginBottom: 60
  }
};

class FindLocalClassBanner extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  render() {
    const { isRtl, responsive } = this.props;

    return (
      <div>
        <div style={styles.heading}>
          {i18n.findLocalClassHeading()}
        </div>
        <GridContainer
          numColumns={2}
          isRtl={isRtl}
          responsive={responsive}
        >
          <img src={pegasus('/shared/images/fill-540x289/misc/beyond-local-map.png')}/>
          <div style={styles.textItem}>
            <div style={styles.subheading}>
              {i18n.findLocalClassSubheading()}
            </div>
            <div style={styles.description}>
              {i18n.findLocalClassDescription()}
            </div>
            <Button
              href={pegasus('/learn/local')}
              color={Button.ButtonColor.gray}
              text={i18n.findLocalClassButton()}
            />
          </div>
        </GridContainer>
        <div style={styles.clear}/>
      </div>
    );
  }
}

export default FindLocalClassBanner;
