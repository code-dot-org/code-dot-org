import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {unassignSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {getStore} from '@cdo/apps/redux';

const styles = {
  buttonMargin: {
    marginLeft: 10
  },
  buttonMarginRTL: {
    marginRight: 10
  }
};

class UnassignButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    // Redux
    unassignSection: PropTypes.func.isRequired
  };

  constructor() {
    super();
    this.state = {text: i18n.assigned(), icon: 'check'};
  }

  onMouseOver = event => {
    this.setState({text: i18n.unassign(), icon: 'times'});
  };

  onMouseOut = event => {
    this.setState({text: i18n.assigned(), icon: 'check'});
  };

  onClickUnassign = () => {
    const {sectionId, unassignSection} = this.props;
    unassignSection(sectionId);
  };

  render() {
    const {text, icon} = this.state;

    // Adjust styles if locale is RTL
    const isRtl = getStore().getState().isRtl;
    const buttonMarginStyle = isRtl
      ? styles.buttonMarginRTL
      : styles.buttonMargin;

    return (
      <div
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseOut}
        style={buttonMarginStyle}
        className={'uitest-unassign-button'}
      >
        <Button
          __useDeprecatedTag
          color={Button.ButtonColor.green}
          text={text}
          icon={icon}
          onClick={this.onClickUnassign}
        />
      </div>
    );
  }
}

export const UnconnectedUnassignButton = UnassignButton;

export default connect(
  null,
  {
    unassignSection
  }
)(UnassignButton);
