import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default class SaveBar extends Component {
  static propTypes = {
    lastSaved: PropTypes.number,
    error: PropTypes.string,
    handleSave: PropTypes.func.isRequired,
    handleView: PropTypes.func.isRequired,
    isSaving: PropTypes.bool
  };

  render() {
    return (
      <div style={styles.saveButtonBackground} className="saveBar">
        <button
          className="btn"
          type="button"
          style={styles.saveButton}
          onClick={this.props.handleView}
          disabled={this.props.isSaving}
        >
          Show
        </button>
        <div style={styles.saveButtonArea}>
          {this.props.lastSaved && !this.props.error && (
            <div style={styles.lastSaved} className="lastSavedMessage">
              {`Last saved at: ${new Date(
                this.props.lastSaved
              ).toLocaleString()}`}
            </div>
          )}
          {this.props.error && (
            <div style={styles.error}>{`Error Saving: ${
              this.props.error
            }`}</div>
          )}
          {this.props.isSaving && (
            <div style={styles.spinner}>
              <FontAwesome icon="spinner" className="fa-spin" />
            </div>
          )}
          <button
            className="btn"
            type="button"
            style={styles.saveButton}
            onClick={e => this.props.handleSave(e, false)}
            disabled={this.props.isSaving}
          >
            Save and Keep Editing
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            style={styles.saveButton}
            onClick={e => this.props.handleSave(e, true)}
            disabled={this.props.isSaving}
          >
            Save and Close
          </button>
        </div>
      </div>
    );
  }
}

const styles = {
  saveButtonBackground: {
    margin: 0,
    position: 'fixed',
    bottom: 0,
    left: 0,
    backgroundColor: color.lightest_gray,
    borderColor: color.lightest_gray,
    height: 50,
    width: '100%',
    zIndex: 900,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  saveButtonArea: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  saveButton: {
    margin: '10px 50px 10px 20px'
  },
  spinner: {
    fontSize: 25,
    padding: 10
  },
  lastSaved: {
    fontSize: 14,
    color: color.level_perfect,
    padding: 15
  },
  error: {
    fontSize: 14,
    color: color.red,
    padding: 15,
    maxWidth: 800
  }
};
