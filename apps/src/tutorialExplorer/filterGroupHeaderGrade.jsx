/* filterGroupHeaderGrade: The set of grades shown in header on desktop.
 */

import React, {PropTypes} from 'react';

const styles = {
  container: {
    display: 'inline-block',
    borderRadius: 6,
    marginTop: 6,
    overflow: 'hidden',
    height: 34,
    lineHeight: '34px'
  },
  item: {
    backgroundColor: 'rgb(101, 205, 214)',
    color: 'white',
    paddingLeft: 30,
    paddingRight: 30,
    fontFamily: "'Gotham 4r', sans-serif",
    fontSize: 14,
    cursor: 'pointer',
    float: 'left'
  },
  select: {
    backgroundColor: "white",
    color: "dimgrey"
  }
};

export default class filterGroupHeaderGrade extends React.Component {
  static propTypes = {
    filterGroup: PropTypes.object.isRequired,
    selection: PropTypes.array.isRequired,
    onUserInput: PropTypes.func.isRequired
  };

  handleChange = (value) => {
    this.props.onUserInput(
      this.props.filterGroup.name,
      value,
      true
    );
  };

  render() {
    const value = this.props.selection[0];

    return (
      <div style={styles.container}>
        {this.props.filterGroup.entries.map(item => (
          <div
            key={item.name}
            onClick={this.handleChange.bind(this, item.name)}
            style={{...styles.item, ...(item.name === value ? styles.select : {})}}
          >
            {item.text}
          </div>
        ))}
      </div>
    );
  }
}
