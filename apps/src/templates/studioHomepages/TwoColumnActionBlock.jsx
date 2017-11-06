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
    responsive: PropTypes.instanceOf(Responsive).isRequired,
    imageUrl: PropTypes.string.isRequired,
    heading: PropTypes.string.isRequired,
    subHeading: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    buttonUrl: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired
  };

  render() {
    const { isRtl, responsive, imageUrl, heading, subHeading, description, buttonUrl, buttonText } = this.props;

    return (
      <div>
        <div style={styles.heading}>
          {heading}
        </div>
        <GridContainer
          numColumns={2}
          isRtl={isRtl}
          responsive={responsive}
        >
          {responsive.isResponsiveCategoryActive('lg') && (
            <img src={imageUrl}/>
          )}
          <div style={styles.textItem}>
            <div style={styles.subheading}>
              {subHeading}
            </div>
            <div style={styles.description}>
              {description}
            </div>
            <Button
              href={buttonUrl}
              color={Button.ButtonColor.gray}
              text={buttonText}
            />
          </div>
        </GridContainer>
        <div style={styles.clear}/>
      </div>
    );
  }
}

export class LocalClassActionBlock extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired,
    showHeading: PropTypes.bool.isRequired,
  };

  render() {
    const { isRtl, responsive, showHeading } = this.props;
    const heading = showHeading ? i18n.findLocalClassHeading() : '';

    return (
      <TwoColumnActionBlock
        isRtl={isRtl}
        responsive={responsive}
        imageUrl={pegasus('/shared/images/fill-540x289/misc/beyond-local-map.png')}
        heading={heading}
        subHeading={i18n.findLocalClassSubheading()}
        description={i18n.findLocalClassDescription()}
        buttonUrl={pegasus('/learn/local')}
        buttonText={i18n.findLocalClassButton()}
      />
    );
  }
}

export class AdministratorResourcesActionBlock extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  render() {
    const { isRtl, responsive } = this.props;

    return (
      <TwoColumnActionBlock
        isRtl={isRtl}
        responsive={responsive}
        imageUrl={pegasus('/images/fill-540x289/2015AR/newcsteacherstrained.png')}
        heading={i18n.administratorResourcesHeading()}
        subHeading={i18n.administratorResourcesSubheading()}
        description={i18n.administratorResourcesDescription()}
        buttonUrl={pegasus('/administrators')}
        buttonText={i18n.yourSchoolAdminButton()}
      />
    );
  }
}
