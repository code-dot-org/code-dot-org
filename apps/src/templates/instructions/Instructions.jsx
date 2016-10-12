import React from 'react';
import classnames from 'classnames';
import ReactDOM from 'react-dom';
import MarkdownInstructions from './MarkdownInstructions';
import NonMarkdownInstructions from './NonMarkdownInstructions';
import InputOutputTable from './InputOutputTable';
import AniGifPreview from './AniGifPreview';
import experiments from '../../experiments';

const styles = {
  main: {
    overflow: 'auto'
  },
  icon: {
    cursor: "pointer",
    padding: "5px 10px",
    margin: "0 10px"
  },
  audio: {
    verticalAlign: "middle",
    margin: "0 10px",
  },
  error: {
    display: 'inline-block',
    marginLeft: 10,
    marginBottom: 0,
    padding: '5px 10px'
  }
};

/**
 * A component for displaying our level instructions text, and possibly also
 * authored hints UI and/or an anigif. These instructions can appear in the top
 * pane or in a modal dialog. In the latter case, we will sometimes show just
 * the hints or just the anigif (in this case instructions/renderedMarkdown
 * props will be undefined).
 */
var Instructions = React.createClass({
  propTypes: {
    puzzleTitle: React.PropTypes.string,
    instructions: React.PropTypes.string,
    instructions2: React.PropTypes.string,
    renderedMarkdown: React.PropTypes.string,
    aniGifURL: React.PropTypes.string,
    authoredHints: React.PropTypes.element,
    inputOutputTable: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),
    inTopPane: React.PropTypes.bool,
    onResize: React.PropTypes.func,
    acapelaSrc: React.PropTypes.string,
  },

  getInitialState: function () {
    return {
      audioSrc: undefined,
      audioError: undefined
    };
  },

  playAudio: function () {
    this.setState({ audioSrc: this.props.acapelaSrc });
  },

  componentWillUpdate: function (nextProps) {
    if (this.props.renderedMarkdown !== nextProps.renderedMarkdown) {
      this.setState({
        audioSrc: undefined,
        audioError: undefined
      });
    }
  },

  componentDidUpdate: function () {
    if (this.refs.audio) {
      $(ReactDOM.findDOMNode(this.refs.audio)).on("error", e => {
        this.setState({
          audioSrc: undefined,
          audioError: "We're sorry, this audio file could not be played."
        });
      });
    }
  },

  render: function () {
    // Body logic is as follows:
    //
    // If we have been given rendered markdown, render a div containing
    // that, optionally with inline-styled margins. We don't need to
    // worry about the title in this case, as it is rendered by the
    // Dialog header
    //
    // Otherwise, render the title and up to two sets of instructions.
    // These instructions may contain spans and images as determined by
    // substituteInstructionImages
    return (
      <div style={styles.main}>
        {this.props.renderedMarkdown && !experiments.isEnabled('hideInstructions') &&
          <MarkdownInstructions
            ref="instructionsMarkdown"
            renderedMarkdown={this.props.renderedMarkdown}
            onResize={this.props.onResize}
            inTopPane={this.props.inTopPane}
          />
        }
        { /* Note: In this case props.instructions might be undefined, but we
          still want to render NonMarkdownInstructions to get the puzzle title */
        !this.props.renderedMarkdown && !experiments.isEnabled('hideInstructions') &&
          <NonMarkdownInstructions
            puzzleTitle={this.props.puzzleTitle}
            instructions={this.props.instructions}
            instructions2={this.props.instructions2}
          />
        }

        {this.props.inputOutputTable &&
          <InputOutputTable data={this.props.inputOutputTable}/>
        }

        {this.props.aniGifURL && !this.props.inTopPane &&
          <img className="aniGif example-image" src={this.props.aniGifURL}/>
        }
        {this.props.aniGifURL && this.props.inTopPane &&
          <AniGifPreview/>
        }

        {experiments.isEnabled('tts') && this.props.acapelaSrc &&
          <div>
            <a
              id="tts-button"
              className={classnames({
                'btn btn-primary' : true,
                'disabled': !!this.state.audioError
              })}
              onClick={!this.state.audioError && this.playAudio}
            ><i className="icon-bullhorn icon-white"></i></a>
            {this.state.audioSrc && <audio ref="audio" style={styles.audio} src={this.state.audioSrc} controls="controls" />}
            {this.state.audioError && <div className="alert alert-error" style={styles.error}>
              <div id="alert-content">{this.state.audioError}</div>
            </div>}
          </div>
        }

        {this.props.authoredHints}
      </div>
    );
  }
});

module.exports = Instructions;
