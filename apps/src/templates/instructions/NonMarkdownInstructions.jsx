var styles = {
  main: {
    marginBottom: 35,
    marginLeft: 80
  }
};

var NonMarkdownInstructions = React.createClass({

  propTypes: {
    puzzleTitle: React.PropTypes.string,
    instructions: React.PropTypes.string,
    instructions2: React.PropTypes.string,
    aniGifURL: React.PropTypes.string,
    authoredHints: React.PropTypes.element
  },

  render: function () {
    return (
      <div>
        <div style={styles.main}>
          <p className='dialog-title'>{ this.props.puzzleTitle }</p>
          {this.props.instructions &&
            <p className='instructions' dangerouslySetInnerHTML={{ __html: this.props.instructions }}/>
          }
          {this.props.instructions2 &&
            <p className='instructions2' dangerouslySetInnerHTML={{ __html: this.props.instructions2 }}/>
          }
        </div>
        {this.props.aniGifURL &&
          <img className="aniGif example-image" src={ this.props.aniGifURL }/>
        }
        {this.props.authoredHints}
      </div>
    );
  }
});

module.exports = NonMarkdownInstructions;
