import PropTypes from 'prop-types';
import React, {Component} from 'react';
import StandardsIntroDialog from './StandardsIntroDialog';
import StandardsProgressTable from './StandardsProgressTable';
import StandardsLegend from './StandardsLegend';

export default class StandardsView extends Component {
  static propTypes = {
    showStandardsIntroDialog: PropTypes.bool
  };

  render() {
    return (
      <div>
        <StandardsIntroDialog isOpen={this.props.showStandardsIntroDialog} />
        <StandardsProgressTable />
        <StandardsLegend />
      </div>
    );
  }
}
