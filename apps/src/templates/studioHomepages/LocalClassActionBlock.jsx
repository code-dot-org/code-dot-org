import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import TwoColumnActionBlock from '../TwoColumnActionBlock';

class LocalClassActionBlock extends Component {
  static propTypes = {
    showHeading: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    responsiveSize: PropTypes.string.isRequired,
  };

  render() {
    const { showHeading, isRtl, responsiveSize } = this.props;
    const heading = showHeading ? i18n.findLocalClassHeading() : '';

    return (
      <TwoColumnActionBlock
        imageUrl={pegasus('/shared/images/fill-540x289/misc/beyond-local-map.png')}
        heading={heading}
        subHeading={i18n.findLocalClassSubheading()}
        description={i18n.findLocalClassDescription()}
        buttonUrl={pegasus('/learn/local')}
        buttonText={i18n.findLocalClassButton()}
        isRtl={isRtl}
        responsiveSize={responsiveSize}
      />
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(LocalClassActionBlock);
