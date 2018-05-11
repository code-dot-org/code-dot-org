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

  state = {
    currentView: ViewType.SUMMARY,
  };

  componentWillReceiveProps(nextProps) {
    if (this.state.currentView !== nextProps.currentView) {
      this.setState({currentView: nextProps.currentView});
    }
  }

  onChange = () => {
    // Display the toggle based on the internal state so that it is
    // more immediately responsive. Once setting internal state is
    // complete, then update the redux currentView.
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
