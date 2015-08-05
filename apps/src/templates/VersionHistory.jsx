var React = require('react');

/**
 * A component for viewing project version history.
 */
module.exports = React.createClass({

  render: function () {
    var versionList = (
      <div style={{margin: '1em 0', textAlign: 'center'}}>
        <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}></i>
      </div>
    );

    return (
      <div className="modal-content" style={{margin: 0}}>
        <p className="dialog-title">Version History</p>
        {versionList}
      </div>
    );
  }
});
