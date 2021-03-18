import React from 'react';
import PropTypes from 'prop-types';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

const styles = {
  container: {
    ...progressStyles.flex,
    ...progressStyles.cellContent
  },
  node: {
    ...progressStyles.inlineBlock,
    minWidth: progressStyles.BUBBLE_CONTAINER_WIDTH,
    textAlign: 'center'
  }
};

const levelSpacerItemShape = PropTypes.shape({
  node: PropTypes.node.isRequired,
  nodeStyle: PropTypes.object,
  sublevelCount: PropTypes.number
});

function SublevelSpacer({sublevelCount}) {
  return (
    <span
      style={{
        width: sublevelCount * progressStyles.LETTER_BUBBLE_CONTAINER_WIDTH
      }}
    />
  );
}
SublevelSpacer.propTypes = {
  sublevelCount: PropTypes.number.isRequired
};

export default function ProgressTableLevelSpacer({items}) {
  return (
    <span style={styles.container}>
      {items.map((item, i) => (
        <span key={`spacer-${i}`} style={progressStyles.flexBetween}>
          <span style={{...styles.node, ...item.nodeStyle}}>{item.node}</span>
          {item.sublevelCount && (
            <SublevelSpacer sublevelCount={item.sublevelCount} />
          )}
        </span>
      ))}
    </span>
  );
}
ProgressTableLevelSpacer.propTypes = {
  items: PropTypes.arrayOf(levelSpacerItemShape).isRequired
};
