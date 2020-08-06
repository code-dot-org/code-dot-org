import React from 'react';
import PropTypes from 'prop-types';
import Attachments from './Attachments';
import {connect} from 'react-redux';

const styles = {
  textArea: {
    width: '95%',
    marginTop: 5
  }
};

class FreeResponse extends React.Component {
  static propTypes = {
    hidden: PropTypes.bool,

    //redux
    freeResponseTitle: PropTypes.string,
    freeResponseProjectId: PropTypes.string,
    freeResponseTextAreaHeight: PropTypes.number,
    freeResponsePlaceholder: PropTypes.string,
    freeResponseLastAttempt: PropTypes.string,
    showUnderageWarning: PropTypes.bool,
    readOnly: PropTypes.bool,
    allowUserUploads: PropTypes.bool
  };

  render() {
    return (
      <div hidden={this.props.hidden}>
        {this.props.freeResponseTitle && (
          <h1 className="free-response-title">
            {this.props.freeResponseTitle}
          </h1>
        )}
        {this.props.allowUserUploads && (
          <Attachments
            readOnly={this.props.readOnly}
            showUnderageWarning={this.props.showUnderageWarning}
            projectId={this.props.freeResponseProjectId}
          />
        )}
        <textarea
          className="free-response-textarea"
          placeholder={this.props.freeResponsePlaceholder}
          style={{
            ...styles.textArea,
            ...{height: this.props.freeResponseTextAreaHeight}
          }}
          readOnly={this.props.readOnly}
          defaultValue={this.props.freeResponseLastAttempt}
        />
      </div>
    );
  }
}

export default connect(state => ({
  readOnly: state.pageConstants.isReadOnlyWorkspace,
  showUnderageWarning: state.pageConstants.is13Plus,
  freeResponseProjectId: state.instructions.freeResponseProjectId,
  freeResponsePlaceholder: state.instructions.freeResponsePlaceholder,
  freeResponseTextAreaHeight: state.instructions.freeResponseTextAreaHeight,
  freeResponseTitle: state.instructions.freeResponseTitle,
  freeResponseLastAttempt: state.instructions.freeResponseLastAttempt,
  allowUserUploads: state.instructions.allowUserUploads
}))(FreeResponse);
