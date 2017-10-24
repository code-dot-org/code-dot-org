/* filterGroupHeaderGrade: The set of grades shown in header on desktop.
 */

import React, {PropTypes} from 'react';

const styles = {
  container: {
    display: 'inline-block',
    marginTop: 6,
    overflow: 'hidden',
    height: 34,
    lineHeight: '34px',
    width: "100%"
  },
  item: {
    backgroundColor: "white",
    color: "dimgrey",
    width: "20%",
    fontFamily: "'Gotham 4r', sans-serif",
    fontSize: 16,
    cursor: 'pointer',
    float: 'left',
    textAlign: "center"
  },
  select: {
    backgroundColor: '#2799a4',
    color: 'white',
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
