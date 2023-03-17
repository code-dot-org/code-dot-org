import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';

/**
 * Many of our hints include Blockly blocks. Unfortunately, Blockly
 * BlockSpaces have a real problem with being created before they are
 * in the DOM, so we need to inject this BlockSpace outside of our
 * React render method once we're confident that this component is in
 * the DOM.
 */
ReadOnlyBlockSpaceFunction.propTypes = {
  block: PropTypes.object.isRequired,
  isRtl: PropTypes.bool
};

export default function ReadOnlyBlockSpaceFunction({block, isRtl}) {
  const [height, setHeight] = useState(100);
  const [blockSpace, setBlockSpace] = useState();
  const container = useRef();

  useEffect(() => {
    if (container.current) {
      console.log('creating read only blockspace');
      console.log(container.current);
      console.log(
        `clientWidth of container is: ${container.current.clientWidth}`
      );
      // let createdBlockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(
      //   container.current,
      //   block,
      //   {
      //     noScrolling: true,
      //     rtl: isRtl
      //   }
      // );

      // let metrics = createdBlockSpace.getMetrics();
      // let height = metrics.contentHeight + metrics.contentTop;

      // setHeight(height);
      // setBlockSpace(createdBlockSpace);
    }
  }, [container]);

  useEffect(() => {
    if (blockSpace) {
      Blockly.cdoUtils.workspaceSvgResize(blockSpace);
    }
  }, [blockSpace]);

  const style = {
    maxHeight: height,
    paddingBottom: 10
  };

  return <div className="block-space" ref={container} style={style} />;
}
