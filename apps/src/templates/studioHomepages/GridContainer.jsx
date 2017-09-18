import React, {PropTypes} from 'react';
import Responsive from '../../responsive';

const styles = {
  container: {
    width: '100%',
  },
  item: {
    float: "left",
  },
  itemRtl: {
    float: "right"
  }
};

const GridContainer = React.createClass({
  propTypes: {
    numColumns: PropTypes.number.isRequired,
    children: PropTypes.arrayOf(React.PropTypes.node),
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  },

  render() {
    const { numColumns, isRtl, responsive } = this.props;

    // Calculate the width of each column, in percentage value.
    const nonResponsiveWidthPercent = 100 / numColumns;

    // Then determine the percentage string for each item.
    const itemWidth = responsive.getResponsiveValue({lg: `${nonResponsiveWidthPercent}%` , md: '100%'});

    const itemStyle = isRtl ? styles.itemRtl : styles.item;

    return (
      <div style={styles.container}>
        {React.Children.map(this.props.children, (child, index) => {
          return (
            <div
              key={index}
              style={{...itemStyle, width: itemWidth}}
            >
              {child}
            </div>
          );
        })}
      </div>
    );
  }
});

export default GridContainer;
