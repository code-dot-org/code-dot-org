import React from 'react';
import PropTypes from 'prop-types';
import {
  BubbleSize,
  bubbleContainerWidths
} from '@cdo/apps/templates/progress/BubbleFactory';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

const styles = {
  node: {
    ...progressStyles.inlineBlock,
    minWidth: bubbleContainerWidths[BubbleSize.full],
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
        width: sublevelCount * bubbleContainerWidths[BubbleSize.letter]
      }}
    />
  );
}
SublevelSpacer.propTypes = {
  sublevelCount: PropTypes.number.isRequired
};

/**
 * A component for laying out arbitrary nodes to align with the level bubbles
 * in `ProgressTableDetailCell`. The primary purpose is to abstract the logic
 * for getting a node to properly align with levels that contain sublevels,
 * since in that case we want the node to align with the parent level and leave
 * space for the sublevels. Example uses include laying out level icons in
 * `ProgressTableLevelIconSet`, and laying out text in `ProgressTableView`
 * expansion rows.
 */
export default function ProgressTableLevelSpacer({items}) {
  return (
    <span className="cell-content" style={progressStyles.flex}>
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

export const unitTestExports = {
  SublevelSpacer
};
