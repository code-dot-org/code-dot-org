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

const IS_TRANSITIONING = 'IS_TRANSITIONING';

/**
 * A toggle that provides a way to switch between detail and summary views of
 * the progress a section of students have made in a course. Teacher view.
 */
class SectionProgressToggle extends React.Component {
  static propTypes = {
    currentView: PropTypes.string.isRequired,
    setCurrentView: PropTypes.func.isRequired,
  };

  state = {
    currentView: ViewType.SUMMARY,
  };

  onChange = () => {
    if (this.props.currentView === ViewType.SUMMARY) {
      this.setState({currentView: ViewType.DETAIL}, () => {
        setTimeout(() => {
          this.props.setCurrentView(ViewType.DETAIL);
        }, 0);
      });
    } else {
      this.setState({currentView: ViewType.SUMMARY}, () => {
        setTimeout(() => {
          this.props.setCurrentView(ViewType.SUMMARY);
        }, 0);
      });
    }
  };

  render() {
    const { currentView } = this.state;

    return (
      <div>
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
        {currentView === IS_TRANSITIONING &&
          <div>
            <FontAwesome icon="spinner"/>
          </div>
        }
      </div>
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
