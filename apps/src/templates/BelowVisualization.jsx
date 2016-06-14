var React = require('react');
import { connect } from 'react-redux';
var commonStyles = require('../commonStyles');
var color = require('../color');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
import InputOutputTable from './instructions/InputOutputTable';
import PromptIcon from './instructions/PromptIcon';
import AniGifPreview from './instructions/AniGifPreview';

const styles = {
  aniGifPreviewWrapper: {
    display: 'inline-block'
  }
};

/**
 * The area below our visualization that is share dby all apps.
 */
const BelowVisualization = React.createClass({
  propTypes: {
    inputOutputTable: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),
    shortInstructions: React.PropTypes.string,
    shortInstructions2: React.PropTypes.string,
    aniGifURL: React.PropTypes.string,
    instructionsInTopPane: React.PropTypes.bool.isRequired,
    smallStaticAvatar: React.PropTypes.string,
    showInstructionsDialog: React.PropTypes.func.isRequired
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
              style={commonStyles.bubble}
              onClick={this.props.showInstructionsDialog}
          >
            <table
                id="prompt-table"
                className={this.props.aniGifURL ? 'with-ani-gif' : undefined}
            >
              <tbody>
                <tr>
                  {smallStaticAvatar && (shortInstructions || aniGifURL) &&
                    <td className="prompt-icon-cell">
                      <PromptIcon src={smallStaticAvatar}/>
                    </td>
                  }
                  <td id="prompt-cell">
                    <p
                        id="prompt"
                        dangerouslySetInnerHTML={{ __html: this.props.shortInstructions}}
                    />
                    {this.props.shortInstructions2 &&
                      <p
                          id="prompt2"
                          dangerouslySetInnerHTML={{ __html: this.props.shortInstructions2}}
                      />
                    }
                  </td>
                </tr>
              </tbody>
            </table>

            {inputOutputTable && <InputOutputTable data={inputOutputTable}/>}
            {aniGifURL && <AniGifPreview/>}
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
  shortInstructions2: state.instructions.shortInstructions2,
  smallStaticAvatar: state.pageConstants.smallStaticAvatar,
  inputOutputTable: state.pageConstants.inputOutputTable,
  showInstructionsDialog: state.pageConstants.showInstructionsDialog
}))(BelowVisualization);
