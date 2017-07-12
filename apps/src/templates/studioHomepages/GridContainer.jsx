import React from 'react';
import styleConstants from '../../styleConstants';

const styles = {
  container: {
    width: styleConstants['content-width'],
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
    numColumns: React.PropTypes.number.isRequired,
    children: React.PropTypes.arrayOf(React.PropTypes.node),
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { numColumns, isRtl } = this.props;
    const itemWidth = styles.container.width / numColumns;
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
