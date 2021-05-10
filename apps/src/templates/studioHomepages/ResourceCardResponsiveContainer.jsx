import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Radium from 'radium';

class ResourceCardResponsiveContainer extends Component {
  static propTypes = {
    children: PropTypes.any,
    responsiveSize: PropTypes.string.isRequired
  };

  render() {
    const colCount = {lg: 3, md: 2, sm: 1, xs: 1}[this.props.responsiveSize];

    return (
      <div>
        {this.props.children.map((child, childIndex) => (
          <div
            key={childIndex}
            style={[
              styles.cardContainer,
              childIndex % colCount === 0 ? styles.startRow : styles.inRow
            ]}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
  },
  regularRow: {
    marginBottom: 20
  },
  cardContainer: {
    float: 'left'
  },
  inRow: {
    paddingLeft: 20,
    paddingTop: 20
  },
  startRow: {
    clear: 'both',
    paddingTop: 20
  }
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize
}))(Radium(ResourceCardResponsiveContainer));
