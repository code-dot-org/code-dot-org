import React, {Component, PropTypes} from 'react';

export default class Hello extends Component {
  static propTypes = {
    name: PropTypes.string,
  };

  render() {
    return (
      <div className="hello">
        Hello From Shared, {this.props.name || "nobody"}!
      </div>
    );
  }
}
