import React, { PropTypes } from 'react';
import ToggleGroup from '../ToggleGroup';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { connect } from 'react-redux';
import {setCurrentView, ViewType} from './sectionProgressRedux';

const styles = {
  toggleButton: {
    padding: '3px 10px'
  }
};

/**
 * A toggle that provides a way to switch between detail and summary views of
 * the progress a section of students have made in a course. Teacher view.
 */
class SectionProgressToggle extends React.Component {
  static propTypes = {
    currentView: PropTypes.string.isRequired,
    setCurrentView: PropTypes.func.isRequired,
  };

  onChange = () => {
    if (this.props.currentView === ViewType.SUMMARY) {
      this.props.setCurrentView(ViewType.DETAIL);
    } else {
      this.props.setCurrentView(ViewType.SUMMARY);
    }
  };

  render() {
    const { currentView } = this.props;

    return (
      <ToggleGroup
        selected={currentView}
        activeColor={color.teal}
        onChange={this.onChange}
      >
        <button value={ViewType.SUMMARY} style={styles.toggleButton}>
          <FontAwesome icon="search-minus"/>
        </button>
        <button value={ViewType.DETAIL} style={styles.toggleButton}>
          <FontAwesome icon="search-plus"/>
        </button>
      </ToggleGroup>
    );

  }
}

export const UnconnectedSectionProgressToggle = SectionProgressToggle;

export default connect(state => ({
  currentView: state.sectionProgress.currentView,
}), dispatch => ({
  setCurrentView(viewType) {
    dispatch(setCurrentView(viewType));
  },
}))(SectionProgressToggle);
