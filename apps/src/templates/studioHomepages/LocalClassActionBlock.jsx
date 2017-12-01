import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import TwoColumnActionBlock from '../TwoColumnActionBlock';

export default class LocalClassActionBlock extends Component {
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
        buttons={[{url: pegasus('/learn/local'), text: i18n.findLocalClassButton()}]}
        isRtl={isRtl}
        responsiveSize={responsiveSize}
      />
    );
  }
}
