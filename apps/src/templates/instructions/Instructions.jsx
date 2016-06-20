var React = require('react');
var MarkdownInstructions = require('./MarkdownInstructions');
var NonMarkdownInstructions = require('./NonMarkdownInstructions');
import InputOutputTable from './InputOutputTable';

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
  }
};

var Instructions = React.createClass({

  propTypes: {
    puzzleTitle: React.PropTypes.string,
    instructions: React.PropTypes.string,
    instructions2: React.PropTypes.string,
    renderedMarkdown: React.PropTypes.string,
    markdownClassicMargins: React.PropTypes.bool,
    aniGifURL: React.PropTypes.string,
    authoredHints: React.PropTypes.element,
    inputOutputTable: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),
    onResize: React.PropTypes.func,
    acapelaSettings: React.PropTypes.shape({
      login: React.PropTypes.string.isRequired,
      app: React.PropTypes.string.isRequired,
      password: React.PropTypes.string.isRequired,
    })
  },

  getInitialState: function () {
    return {
      voices: [{
        id: "micah22k",
        name: "Micah"
      }, {
        id: "nelly22k",
        name: "Nelly"
      }, {
        id: "willlittlecreature22k",
        name: "Yodit"
      }],
      lastVoice: "micah22k"
    };
  },

  playAudio: function (text, voice) {
    $.getJSON("https://vaas.acapela-group.com/Services/UrlMaker?jsoncallback=?", {
      cl_login: this.props.acapelaSettings.login,
      cl_app: this.props.acapelaSettings.app,
      cl_pwd: this.props.acapelaSettings.password,
      req_voice: voice,
      req_text: text,
    }, function (data) {
      this.setState({
        lastVoice: voice,
        audioSrc: data.snd_url
      });
    }.bind(this));
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
    var instructions;
    var text;
    if (this.props.renderedMarkdown) {
      instructions = (
        <MarkdownInstructions
          ref="instructionsMarkdown"
          renderedMarkdown={this.props.renderedMarkdown}
          markdownClassicMargins={this.props.markdownClassicMargins}
          onResize={this.props.onResize}
          inTopPane={this.props.inTopPane}
        />
      );

      var temporaryElement = document.createElement('div');
      temporaryElement.innerHTML = this.props.renderedMarkdown;
      text = temporaryElement.textContent;
    } else {
      instructions = (
        <NonMarkdownInstructions
          puzzleTitle={this.props.puzzleTitle}
          instructions={this.props.instructions}
          instructions2={this.props.instructions2}
        />
      );
      text = this.props.instructions;
    }
    return (
      <div style={styles.main}>
        {instructions}
        {this.props.inputOutputTable && <InputOutputTable data={this.props.inputOutputTable}/>}
        {this.props.aniGifURL &&
          <img className="aniGif example-image" src={ this.props.aniGifURL }/>
        }
        {this.props.acapelaSettings && (<div>
          <p style={{lineHeight: "14px", fontSize: "12px"}}>Note that in trial mode, we don't have access to the high-quality children's voices that we would probably want to use in production</p>
          <div className="btn-group dropup">
            <a className="btn btn-primary" onClick={this.playAudio.bind(this, text, this.state.lastVoice)}><i className="icon-bullhorn icon-white"></i></a>
            <a className="btn btn-primary dropdown-toggle" data-toggle="dropdown"><span className="caret"></span></a>
            <ul className="dropdown-menu">
              {this.state.voices.map(voice => <li key={voice.id}><a onClick={this.playAudio.bind(this, text, voice.id)}>{voice.name}</a></li>)}
            </ul>
          </div>
          {this.state.audioSrc && <audio style={styles.audio} src={this.state.audioSrc} controls='controls' />}
        </div>)}
        {this.props.authoredHints}
      </div>
    );
  }
});

module.exports = Instructions;
