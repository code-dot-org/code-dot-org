import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import {getCurrentScriptData} from '../sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import VirtualizedDetailView from './VirtualizedDetailView';

class DetailView extends Component {
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
        <VirtualizedDetailView
          section={section}
          stageExtrasEnabled={section.stageExtras}
          scriptData={scriptData}
          onScroll={this.afterScroll}
        />
        <ProgressLegend excludeCsfColumn={!scriptData.csf} />
      </div>
    );
  }
}

export const UnconnectedDetailView = DetailView;

export default connect(state => ({
  section: state.sectionData.section,
  scriptData: getCurrentScriptData(state)
}))(DetailView);
