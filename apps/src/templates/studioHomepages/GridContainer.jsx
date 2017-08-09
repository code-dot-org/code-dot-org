import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
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

const GridContainer = createReactClass({
  propTypes: {
    numColumns: PropTypes.number.isRequired,
    children: PropTypes.arrayOf(PropTypes.node),
    isRtl: PropTypes.bool.isRequired
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
