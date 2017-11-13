import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import TwoColumnActionBlock from '../TwoColumnActionBlock';

export class AdministratorResources extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsiveSize: PropTypes.string.isRequired,
  };

  render() {
    const { isRtl, responsiveSize } = this.props;

    return (
      <TwoColumnActionBlock
        imageUrl={pegasus('/images/fill-540x289/2015AR/newcsteacherstrained.png')}
        heading={i18n.administratorResourcesHeading()}
        subHeading={i18n.administratorResourcesSubheading()}
        description={i18n.administratorResourcesDescription()}
        buttons={[{url: pegasus('/administrators'), text: i18n.yourSchoolAdminButton()}]}
        isRtl={isRtl}
        responsiveSize={responsiveSize}
      />
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(AdministratorResources);
