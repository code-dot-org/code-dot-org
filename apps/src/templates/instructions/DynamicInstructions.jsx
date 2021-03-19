import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import ImmersiveReaderButton from './ImmersiveReaderButton';
import i18n from '@cdo/locale';
import styleConstants from '../../styleConstants';

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

/**
 * A component for showing Dynamic Instructions, in which the app can
 * dynamically change which of the set of possible instructions is shown at any
 * time.  The component is pre-sized to fit the largest of the possible
 * instructions.  It is not resizable or collapsible.
 */
class DynamicInstructions extends React.Component {
  static propTypes = {
    dynamicInstructions: PropTypes.object,
    dynamicInstructionsKey: PropTypes.string,
    setInstructionsRenderedHeight: PropTypes.func
  };

  state = {
    dynamicInstructionsHeight: null
  };

  constructor(props) {
    super(props);

    this.dynamicInstructionsRefs = {};
  }

  componentDidMount() {
    let largestHeight = 0;

    // Find the tallest of our dynamic instructions.
    if (this.props.dynamicInstructions) {
      Object.keys(this.props.dynamicInstructions).forEach(key => {
        const height = $(
          ReactDOM.findDOMNode(this.dynamicInstructionsRefs[key])
        ).outerHeight(true);
        if (height > largestHeight) {
          largestHeight = height;
        }
      });
    }

    // Resize the parent div to be the height of the largest dynamic instruction.
    if (this.props.setInstructionsRenderedHeight) {
      this.props.setInstructionsRenderedHeight(
        largestHeight + HEADER_HEIGHT + RESIZER_HEIGHT + 20 + 10
      );
    }
  }

  render() {
    // Fall back to a space because the ImmersiveReaderButton only gets one
    // chance to render its icon, and it only works if there is non-empty text.
    const immersiveReaderText =
      this.props.dynamicInstructions[this.props.dynamicInstructionsKey] || ' ';

    return (
      <div>
        <ImmersiveReaderButton
          title={i18n.instructions()}
          text={immersiveReaderText}
        />

        <div
          style={{
            marginTop: 10,
            position: 'relative',
            height: this.state.dynamicInstructionsHeight
          }}
        >
          {Object.keys(this.props.dynamicInstructions).map(key => {
            return (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  opacity: key === this.props.dynamicInstructionsKey ? 1 : 0
                }}
                key={key}
                ref={ref => (this.dynamicInstructionsRefs[key] = ref)}
              >
                <div>{this.props.dynamicInstructions[key]}</div>
                <div style={{clear: 'both'}} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

module.exports = DynamicInstructions;
