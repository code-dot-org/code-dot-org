var msg = require('../locale');

var styles = {
  main: {
    display: 'inline'
  }
};

var Controls = React.createClass({
  propTypes: {
    imgUrl: React.PropTypes.string.isRequired,
    projectLevel: React.PropTypes.bool.isRequired,
    submittable: React.PropTypes.bool.isRequired,
    submitted: React.PropTypes.bool.isRequired,
  },

  render: function () {
    var id;
    var contents;
    var divClass = 'share-cell-none';

    if (this.props.projectLevel) {
      return <div/>;
    }

    if (this.props.submittable) {
      if (this.props.submitted) {
        id = 'unsubmitButton';
        contents = msg.unsubmit();
        divClass = 'share-cell-enabled';
      } else {
        id = 'submitButton';
        contents = msg.submit();
      }
    } else {
      id = 'finishButton';
      contents = msg.finish();
    }

    return (
      <div style={styles.main}>
        <div id="share-cell" className={divClass}>
          <button id={id} className="share">
            <img src={this.props.imgUrl}/>
            {contents}
          </button>
        </div>
      </div>
    );
  }
});

module.exports = Controls;
