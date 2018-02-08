import Radium from 'radium';
import React, {PropTypes} from 'react';
import * as dataStyles from './dataStyles';

class EditLink extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  };

  render() {
    return (
      <a style={dataStyles.link} onClick={this.props.onClick}>
        {this.props.name}
      </a>
    );
  }
}

export default Radium(EditLink);
