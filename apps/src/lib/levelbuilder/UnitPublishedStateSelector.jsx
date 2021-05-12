//import PropTypes from 'prop-types';
import React, {Component} from 'react';
//import HelpTip from '@cdo/apps/lib/ui/HelpTip';

const publishedStates = ['Visible']; /*'In Development', 'Preview',*/

export default class UnitPublishedStateSelector extends Component {
  static propTypes = {};

  constructor(props) {
    super(props);

    this.state = {
      publishedState: 'Visible'
    };
  }

  handlePublishedStateChange = value => {
    switch (value) {
      //case 'In Development':
      //break;
      //case 'Preview':
      //break;
      case 'Visible':
      default:
        break;
    }
  };

  render() {
    return (
      <div>
        <label>
          Published State
          <select
            value={this.state.publishedState}
            style={styles.dropdown}
            onChange={this.handlePublishedStateChange}
          >
            {publishedStates.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }
}

const styles = {
  dropdown: {
    margin: '0 6px'
  }
};
