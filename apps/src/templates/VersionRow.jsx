var React = require('react');

/**
 * A single row in the VersionHistory modal, describing one version of a project.
 */
module.exports = React.createClass({
  propTypes: {
    lastModified: React.PropTypes.instanceOf(Date),
    onChoose: React.PropTypes.func
  },

  render: function () {

    return (
      <tr className="versionRow" onDoubleClick={this.props.onChoose}>
        <td>{this.props.lastModified.toString()}</td>
        <td width="250" style={{textAlign: 'right'}}>
          <button className="btn-info" onClick={this.props.onChoose}>
            Restore this Version
          </button>
        </td>
      </tr>
    );
  }
});
