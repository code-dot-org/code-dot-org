var React = require('react');
import { connect } from 'react-redux';
var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var InputOutputTable = require('./InputOutputTable');
import PromptIcon from './instructions/PromptIcon';

/**
 * The area below our visualization that is share dby all apps.
 */
const BelowVisualization = React.createClass({
  propTypes: {
    inputOutputTable: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),
    shortInstructions: React.PropTypes.string,
    aniGifURL: React.PropTypes.string,
    instructionsInTopPane: React.PropTypes.bool.isRequired,
    smallStaticAvatar: React.PropTypes.string
  },

  render() {
    const {
      inputOutputTable,
      instructionsInTopPane,
      smallStaticAvatar,
      shortInstructions,
      aniGifURL
    } = this.props;
    return (
      <ProtectedStatefulDiv id="belowVisualization">
        {!instructionsInTopPane &&
          <div
              id="bubble"
              className="clearfix"
          >
            <table id="prompt-table">
              <tbody>
                <tr>
                  {smallStaticAvatar && (shortInstructions || aniGifURL) &&
                    <td className="prompt-icon-cell">
                      <PromptIcon src={smallStaticAvatar}/>
                    </td>
                  }
                  <td id="prompt-cell">
                    <p id="prompt"/>
                    <p id="prompt2" style={commonStyles.hidden}/>
                  </td>
                </tr>
              </tbody>
            </table>

            {inputOutputTable && <InputOutputTable data={inputOutputTable}/>}

            <div id="ani-gif-preview-wrapper" style={commonStyles.hidden}>
              <div id="ani-gif-preview">
              </div>
            </div>
          </div>
        }
      </ProtectedStatefulDiv>
    );
  }
});

export default connect(state => ({
  instructionsInTopPane: state.pageConstants.instructionsInTopPane,
  aniGifURL: state.pageConstants.aniGifURL,
  shortInstructions: state.instructions.shortInstructions,
  smallStaticAvatar: state.pageConstants.smallStaticAvatar
}))(BelowVisualization);
