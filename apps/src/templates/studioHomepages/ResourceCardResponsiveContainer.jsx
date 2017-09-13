import React, {Component, PropTypes} from 'react';
import Responsive from '../../responsive';
import Radium from 'radium';

const styles = {
  container: {
    width: '100%',
    display: "flex",
    justifyContent: "space-between"
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

class ResourceCardResponsiveContainer extends Component {
  static propTypes = {
    children: PropTypes.any,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  render() {
    const colCount = this.props.responsive.getResponsiveValue({lg: 3, md: 2, xs: 1});

    return (
      <div>
        {this.props.children.map(
          (child, childIndex) => (
            <div
              key={childIndex}
              style={[
                styles.cardContainer,
                childIndex % colCount === 0 ? styles.startRow : styles.inRow
              ]}
            >
              {child}
            </div>
          )
        )}
      </div>
    );
  }
}

export default Radium(ResourceCardResponsiveContainer);
