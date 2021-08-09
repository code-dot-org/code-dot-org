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
    visible: PropTypes.bool.isRequired
  };

  render() {
    if (this.props.visible) {
      return (
        <p style={style} className="google-classroom-attribution">
          {i18n.googleClassroomAttribution()}
        </p>
      );
    } else {
      return null;
    }
  }
}

export default connect(state => ({
  visible: canShowGoogleShareButton(state)
}))(GoogleClassroomAttributionLabel);
