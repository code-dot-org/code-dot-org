var React = require('react');

var defaultIcons = {
  image: 'fa fa-picture-o',
  audio: 'fa fa-music',
  video: 'fa fa-video-camera',
  unknown: 'fa fa-question'
};

function getThumbnail(type, src) {
  switch (type) {
    case 'image':
      return <img src={src} style={{width: 'auto', maxWidth: '100%', height: 'auto', maxHeight: '100%', zoom: 2}}/>;
    default:
      return <i className={defaultIcons[type]} style={{margin: '15px 0', fontSize: '32px'}}></i>;
  }
}

module.exports = React.createClass({
  propTypes: {
    name: React.PropTypes.instanceOf(String).isRequired,
    type: React.PropTypes.oneOf(['image', 'sound', 'video', 'unknown']).isRequired,
    src: React.PropTypes.instanceOf(String),
    delete: React.PropTypes.instanceOf(Function).isRequired
  },

  getInitialState: function () {
    return {
      confirmingDelete: false
    };
  },

  confirmDelete: function () {
    this.setState({confirmingDelete: true});
  },

  cancelDelete: function () {
    this.setState({confirmingDelete: false});
  },

  render: function () {
    var actions = (this.state.confirmingDelete) ? (
      <td width="250" style={{textAlign: 'right'}}>
        <button className="btn-danger" onClick={this.props.delete}>Delete File</button>
        <button onClick={this.cancelDelete}>Cancel</button>
      </td>
    ) : (
      <td width="250" style={{textAlign: 'right'}}>
        <button>Set as Image</button>
        <button><i className="fa fa-eye"></i></button>
        <button className="btn-danger" onClick={this.confirmDelete}><i className="fa fa-trash-o"></i></button>
      </td>
    );

    return (
      <tr className="assetRow">
        <td width="80"><div className="assetThumbnail" style={{
          width: '60px', height: '60px', margin: '10px auto', background: '#eee', border: '1px solid #ccc', textAlign: 'center'
        }}>{getThumbnail(this.props.type, this.props.src)}</div></td>
        <td>{this.props.name}</td>
      {actions}
      </tr>
    );
  }
});
