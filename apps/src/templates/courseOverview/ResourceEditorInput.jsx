import PropTypes from 'prop-types';
import React, {Component} from 'react';

export default class ResourceEditorInput extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    resource: PropTypes.shape({
      type: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired
    }).isRequired,
    inputStyle: PropTypes.object.isRequired,
    handleChangeType: PropTypes.func.isRequired,
    handleChangeLink: PropTypes.func.isRequired
  };

  render() {
    const {
      id,
      resource,
      inputStyle,
      handleChangeType,
      handleChangeLink
    } = this.props;

    return (
      <div style={{marginTop: 8}}>
        Resource {id}
        <div>Type</div>
        <input
          name="resourceTypes[]"
          style={inputStyle}
          value={resource.type}
          onChange={handleChangeType}
        />
        <div>Link</div>
        <input
          style={inputStyle}
          name="resourceLinks[]"
          value={resource.link}
          onChange={handleChangeLink}
        />
      </div>
    );
  }
}
