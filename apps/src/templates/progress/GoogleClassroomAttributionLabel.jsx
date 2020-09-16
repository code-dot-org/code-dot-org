import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import {canShowGoogleShareButton} from './googlePlatformApiRedux';

const style = {
  textAlign: 'center',
  paddingTop: 5
};

class GoogleClassroomAttributionLabel extends React.Component {
  static propTypes = {
    // redux provided
    hidden: PropTypes.bool.isRequired
  };

  render() {
    if (!this.props.hidden) {
      return <p style={style}>{i18n.googleClassroomAttribution()}</p>;
    } else {
      return null;
    }
  }
}

export default connect(state => ({
  hidden: !canShowGoogleShareButton(state)
}))(GoogleClassroomAttributionLabel);
