var styles = {
  main: {
    marginBottom: 35,
    marginLeft: 80
  }
};

var NonMarkdownInstructions = function (props) {
  return (
    <div style={styles.main}>
      <p className='dialog-title'>{props.puzzleTitle}</p>
      {props.instructions &&
        <p className='instructions' dangerouslySetInnerHTML={{__html: props.instructions}}/>
      }
      {props.instructions2 &&
        <p className='instructions2' dangerouslySetInnerHTML={{__html: props.instructions2}}/>
      }
    </div>
  );
};

NonMarkdownInstructions.propTypes = {
  puzzleTitle: React.PropTypes.string.isRequired,
  instructions: React.PropTypes.string,
  instructions2: React.PropTypes.string
};

module.exports = NonMarkdownInstructions;
