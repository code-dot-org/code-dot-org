import React, {PropTypes} from 'react';

const styles = {
  container: {
    width: "100%",
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
    responsiveSize: PropTypes.string.isRequired,
  },

  render() {
    const { numColumns, isRtl, responsiveSize } = this.props;

    // Calculate the width of each column, in percentage value.
    const nonResponsiveWidthPercent = 100 / numColumns;

    // Then determine the percentage string for each item.

    const itemWidth = ({lg: `${nonResponsiveWidthPercent}%`, md: '100%'})[responsiveSize];
    // const itemWidth = ({lg: 485, md: 700, sm: 600, xs: 310})[responsiveSize];

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
