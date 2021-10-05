import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {unassignSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import UnassignSectionDialog from '@cdo/apps/templates/UnassignSectionDialog';

class UnassignButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    courseName: PropTypes.string.isRequired,
    // Redux
    unassignSection: PropTypes.func.isRequired,
    isRtl: PropTypes.bool
  };

  constructor() {
    super();
    this.state = {
      text: i18n.assigned(),
      showUnassignDialog: false,
      icon: 'check'
    };
  }

  onMouseOver = event => {
    this.setState({text: i18n.unassign(), icon: 'times'});
  };

  onMouseOut = event => {
    this.setState({text: i18n.assigned(), icon: 'check'});
  };

  toggleUnassignDialog = () => {
    this.setState({
      showUnassignDialog: !this.state.showUnassignDialog
    });
  };

  confirmUnassign = () => {
    this.props.unassignSection(this.props.sectionId);
  };

  render() {
    const {text, icon, showUnassignDialog} = this.state;
    const {isRtl, sectionId, courseName} = this.props;

    // Adjust styles if locale is RTL
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
          onClick={this.toggleUnassignDialog}
        />
        {showUnassignDialog && (
          <UnassignSectionDialog
            isOpen={true}
            sectionId={sectionId}
            courseName={courseName}
            onClose={this.toggleUnassignDialog}
            unassignSection={this.confirmUnassign}
          />
        )}
      </div>
    );
  }
}

const styles = {
  buttonMargin: {
    marginLeft: 10,
    display: 'flex',
    alignItems: 'center'
  },
  buttonMarginRTL: {
    marginRight: 10,
    display: 'flex',
    alignItems: 'center'
  }
};

export const UnconnectedUnassignButton = UnassignButton;

export default connect(
  state => ({
    isRtl: state.isRtl
  }),
  {unassignSection}
)(UnassignButton);
