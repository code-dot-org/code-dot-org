import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import ImmersiveReaderButton from './ImmersiveReaderButton';
import i18n from '@cdo/locale';
import styleConstants from '../../styleConstants';
import SafeMarkdown from '../SafeMarkdown';
import _ from 'lodash';

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

/**
 * A component for showing Dynamic Instructions, in which the app can
 * dynamically change which of the set of possible instructions is shown at any
 * time.  The component is pre-sized to fit the largest of the possible
 * instructions.  It is not resizable or collapsible.  It does handle resize
 * events since these might adjust the available width and reflow the content,
 * so we need to recalculate the maximum height.  The instruction text is
 * provided as Markdown.
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
    this.updateLayout();

    this.updateLayoutListener = _.throttle(this.updateLayout, 200);
    window.addEventListener('resize', this.updateLayoutListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateLayoutListener);
  }

  updateLayout = () => {
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
        largestHeight + HEADER_HEIGHT + RESIZER_HEIGHT + 20
      );
    }
  };

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
            ...styles.container,
            height: this.state.dynamicInstructionsHeight
          }}
        >
          {Object.keys(this.props.dynamicInstructions).map(key => {
            return (
              <div
                style={{
                  ...styles.instruction,
                  opacity: key === this.props.dynamicInstructionsKey ? 1 : 0
                }}
                key={key}
              >
                <div
                  className="dynamic-instructions-markdown"
                  ref={ref => (this.dynamicInstructionsRefs[key] = ref)}
                >
                  <SafeMarkdown
                    markdown={this.props.dynamicInstructions[key]}
                    openExternalLinksInNewTab={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'relative',
    marginTop: 10,
    marginRight: 50
  },
  instruction: {
    position: 'absolute',
    top: 0
  }
};

module.exports = DynamicInstructions;
