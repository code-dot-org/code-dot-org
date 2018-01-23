import React, { PropTypes, Component } from 'react';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';

/**
 * Component used in levelbuilder that provides a checkbox for whether we should
 * use the CSF or CSP version of the legend, and includes a preview of what the
 * legend looks like
 */
export default class LegendSelector extends Component {
  static propTypes = {
    excludeCsf: PropTypes.bool.isRequired,
    inputStyle: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      checked: this.props.excludeCsf
    };
  }

  handleChange = () => {
    this.setState({checked: !this.state.checked});
  };

  render() {
    const { inputStyle } = this.props;
    return (
      <label>
        Exclude CSF Progress Bubbles From Legend
        <input
          name="exclude_csf_column_in_legend"
          type="checkbox"
          checked={this.state.checked}
          onChange={this.handleChange}
          style={inputStyle}
        />
        <ProgressLegend excludeCsfColumn={this.state.checked}/>
      </label>
    );
  }
}
