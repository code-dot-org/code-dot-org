import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import {getCurrentScriptData} from '../sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import SummaryViewLegend from './SummaryViewLegend';
import VirtualizedSummaryView from './VirtualizedSummaryView';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';

class SummaryView extends Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType
  };

  // Re-attaches mouse handlers on tooltip targets to tooltips.  Called
  // after the virtualized MultiGrid component scrolls, which may cause
  // target cells to be created or destroyed.
  afterScroll = _.debounce(ReactTooltip.rebuild, 10);

  render() {
    const {section, scriptData} = this.props;

    return (
      <div>
        <VirtualizedSummaryView
          section={section}
          scriptData={scriptData}
          onScroll={this.afterScroll}
        />
        <SummaryViewLegend showCSFProgressBox={scriptData.csf} />
      </div>
    );
  }
}

export const UnconnectedSummaryView = SummaryView;

export default connect(state => ({
  section: state.sectionData.section,
  scriptData: getCurrentScriptData(state)
}))(SummaryView);
